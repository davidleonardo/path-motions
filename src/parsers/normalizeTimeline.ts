import { NormalizedTrip, PlaceVisit } from '../domain/timeline';
import { segmentPointsIntoTrip } from '../geo/segmentation';
import { detectTimelineFormat } from './detectTimelineFormat';
import { parseGoogleTimelineOnDevice, parseCoordinateString, parseTimestamp, RawParsedPoint } from './GoogleTimelineAdapter';
import { parseGoogleTakeoutRecords } from './GoogleTakeoutAdapter';

export interface ParseResult {
  trips: NormalizedTrip[];
  format: string;
  totalPointsParsed: number;
}

export function normalizeTimelineJson(jsonData: any, fileName?: string): ParseResult {
  const format = detectTimelineFormat(jsonData);

  let rawPoints: RawParsedPoint[] = [];
  let explicitVisits: PlaceVisit[] = [];

  if (format === 'google-timeline-on-device' || jsonData.semanticSegments || jsonData.rawSignals || jsonData.timelineObjects) {
    const parsed = parseGoogleTimelineOnDevice(jsonData);
    rawPoints = parsed.points;
    explicitVisits = parsed.visits;
  } else if (format === 'google-takeout-records') {
    rawPoints = parseGoogleTakeoutRecords(jsonData);
  } else if (Array.isArray(jsonData)) {
    jsonData.forEach((item, idx) => {
      const coord = parseCoordinateString(item.point || item.latLng || item.position) ||
        (item.lat !== undefined && item.lng !== undefined ? { lat: Number(item.lat), lng: Number(item.lng) } : null) ||
        (item.latitudeE7 && item.longitudeE7 ? { lat: item.latitudeE7 / 1e7, lng: item.longitudeE7 / 1e7 } : null);

      const ts = parseTimestamp(item.time || item.timestamp || item.timestampMs) || (Date.now() + idx * 1000);
      if (coord && ts) {
        rawPoints.push({ lat: coord.lat, lng: coord.lng, timestampMs: ts, source: 'array' });
      }
    });
  }

  if (rawPoints.length === 0) {
    throw new Error('No valid location coordinates found in this file. Please verify this is a Google Timeline or Takeout JSON export.');
  }

  // Sort by time
  rawPoints.sort((a, b) => a.timestampMs - b.timestampMs);

  // Deduplicate points with identical timestamps or extreme proximity
  const uniquePoints: RawParsedPoint[] = [];
  let lastPoint: RawParsedPoint | null = null;

  for (const p of rawPoints) {
    if (!lastPoint || p.timestampMs !== lastPoint.timestampMs || Math.abs(p.lat - lastPoint.lat) > 0.00005 || Math.abs(p.lng - lastPoint.lng) > 0.00005) {
      uniquePoints.push(p);
      lastPoint = p;
    }
  }

  // Group into journeys/trips by time gap (> 4 hours gap or > 50km distance gap starts a new trip)
  const tripGroups: RawParsedPoint[][] = [];
  let currentGroup: RawParsedPoint[] = [uniquePoints[0]];

  for (let i = 1; i < uniquePoints.length; i++) {
    const curr = uniquePoints[i];
    const prev = uniquePoints[i - 1];
    const timeGapHours = (curr.timestampMs - prev.timestampMs) / 3600000;

    if (timeGapHours > 4) {
      if (currentGroup.length >= 4) {
        tripGroups.push(currentGroup);
      }
      currentGroup = [curr];
    } else {
      currentGroup.push(curr);
    }
  }

  if (currentGroup.length >= 4) {
    tripGroups.push(currentGroup);
  } else if (tripGroups.length === 0) {
    tripGroups.push(uniquePoints);
  }

  // Order trips from most recent to oldest
  tripGroups.sort((a, b) => b[0].timestampMs - a[0].timestampMs);

  // Limit candidate trips to top 50 meaningful trips for performance
  const candidateGroups = tripGroups.slice(0, 50);

  const trips = candidateGroups.map((group, idx) => {
    const startDate = new Date(group[0].timestampMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const defaultTitle = fileName
      ? `${fileName.replace(/\.[^/.]+$/, '')} — ${startDate}`
      : `Journey #${idx + 1} (${startDate})`;

    // Filter relevant visits for this trip time range
    const tripStart = group[0].timestampMs;
    const tripEnd = group[group.length - 1].timestampMs;
    const tripVisits = explicitVisits.filter(
      (v) => v.arrivalMs >= tripStart - 3600000 && v.departureMs <= tripEnd + 3600000
    );

    return segmentPointsIntoTrip(group, defaultTitle, tripVisits);
  });

  return {
    trips,
    format: format === 'unknown' ? 'Google Timeline on-device' : format,
    totalPointsParsed: uniquePoints.length,
  };
}
