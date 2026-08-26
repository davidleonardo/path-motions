import { NormalizedTrip, PlaceVisit } from '../domain/timeline';
import { segmentPointsIntoTrip } from '../geo/segmentation';
import { detectTimelineFormat } from './detectTimelineFormat';
import { parseGoogleTimelineOnDevice, RawParsedPoint } from './GoogleTimelineAdapter';
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

  if (format === 'google-timeline-on-device') {
    const parsed = parseGoogleTimelineOnDevice(jsonData);
    rawPoints = parsed.points;
    explicitVisits = parsed.visits;
  } else if (format === 'google-takeout-records') {
    rawPoints = parseGoogleTakeoutRecords(jsonData);
  } else if (Array.isArray(jsonData)) {
    jsonData.forEach((item, idx) => {
      const lat = item.lat ?? (item.latitudeE7 ? item.latitudeE7 / 1e7 : item.latitude);
      const lng = item.lng ?? (item.longitudeE7 ? item.longitudeE7 / 1e7 : item.longitude);
      const ts = item.timestampMs || (item.timestamp ? Date.parse(item.timestamp) : Date.now() + idx * 1000);
      if (lat !== undefined && lng !== undefined && !isNaN(ts)) {
        rawPoints.push({ lat, lng, timestampMs: ts, source: 'array' });
      }
    });
  }

  if (rawPoints.length === 0) {
    throw new Error('No valid location coordinates found in this file.');
  }

  // Deduplicate points with identical timestamp and coords
  const uniquePoints: RawParsedPoint[] = [];
  const seen = new Set<string>();

  for (const p of rawPoints) {
    const key = `${p.timestampMs}-${p.lat.toFixed(6)}-${p.lng.toFixed(6)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push(p);
    }
  }

  // Sort by time
  uniquePoints.sort((a, b) => a.timestampMs - b.timestampMs);

  // Group into trips by day or continuous trips (> 8 hour gap divides trips)
  const tripGroups: RawParsedPoint[][] = [];
  let currentGroup: RawParsedPoint[] = [uniquePoints[0]];

  for (let i = 1; i < uniquePoints.length; i++) {
    const curr = uniquePoints[i];
    const prev = uniquePoints[i - 1];
    const timeGapHours = (curr.timestampMs - prev.timestampMs) / 3600000;

    if (timeGapHours > 8) {
      if (currentGroup.length >= 3) {
        tripGroups.push(currentGroup);
      }
      currentGroup = [curr];
    } else {
      currentGroup.push(curr);
    }
  }

  if (currentGroup.length >= 3) {
    tripGroups.push(currentGroup);
  } else if (tripGroups.length === 0) {
    tripGroups.push(uniquePoints);
  }

  const trips = tripGroups.map((group, idx) => {
    const startDate = new Date(group[0].timestampMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const defaultTitle = fileName ? `${fileName.replace(/\.[^/.]+$/, '')} (${startDate})` : `Trip ${idx + 1} — ${startDate}`;
    return segmentPointsIntoTrip(group, defaultTitle, explicitVisits);
  });

  return {
    trips,
    format,
    totalPointsParsed: uniquePoints.length,
  };
}
