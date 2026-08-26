import { NormalizedTrip, PlaceVisit } from '../domain/timeline';
import { segmentPointsIntoTrip } from '../geo/segmentation';
import { parseCoordinateString, parseTimestamp, RawParsedPoint } from './GoogleTimelineAdapter';
import { parseGoogleTakeoutRecords } from './GoogleTakeoutAdapter';

export interface ParseResult {
  trips: NormalizedTrip[];
  format: string;
  totalPointsParsed: number;
}

export function normalizeTimelineJson(jsonData: any, fileName?: string): ParseResult {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid JSON file format.');
  }

  const segments = jsonData.semanticSegments || jsonData.timelineObjects || (Array.isArray(jsonData) ? jsonData : null);

  // If it's a modern Google Timeline format with semanticSegments or timelineObjects
  if (segments && Array.isArray(segments)) {
    const tripsByDate = new Map<string, { date: string; points: RawParsedPoint[]; visits: PlaceVisit[] }>();
    let totalPoints = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!seg) continue;

      const startTime = seg.startTime || (seg.timelinePath && seg.timelinePath[0]?.time);
      if (!startTime) continue;

      const dateKey = typeof startTime === 'string' && startTime.length >= 10 ? startTime.slice(0, 10) : '2026-01-01';

      let trip = tripsByDate.get(dateKey);
      if (!trip) {
        trip = { date: dateKey, points: [], visits: [] };
        tripsByDate.set(dateKey, trip);
      }

      // 1. timelinePath
      if (Array.isArray(seg.timelinePath)) {
        for (const item of seg.timelinePath) {
          if (!item) continue;
          const c = parseCoordinateString(item.point || item.latLng || item.position);
          const ts = parseTimestamp(item.time || item.timestamp);
          if (c && ts) {
            trip.points.push({ lat: c.lat, lng: c.lng, timestampMs: ts, source: 'timelinePath' });
            totalPoints++;
          }
        }
      }

      // 2. visit
      if (seg.visit || seg.placeVisit) {
        const v = seg.visit || seg.placeVisit;
        const loc =
          v.topCandidate?.placeLocation?.latLng ||
          (v.location?.latitudeE7 ? `${v.location.latitudeE7 / 1e7}, ${v.location.longitudeE7 / 1e7}` : null) ||
          v.location?.latLng;

        const c = parseCoordinateString(loc);
        const startMs = parseTimestamp(seg.startTime || v.duration?.startTimestamp);
        const endMs = parseTimestamp(seg.endTime || v.duration?.endTimestamp);

        if (c && startMs) {
          trip.points.push({ lat: c.lat, lng: c.lng, timestampMs: startMs, source: 'visit' });
          trip.visits.push({
            id: `v-${startMs}`,
            name: v.topCandidate?.semanticType || v.location?.name || 'Visited Location',
            coordinate: c,
            arrivalMs: startMs,
            departureMs: endMs || startMs + 15 * 60000,
            durationMs: endMs ? Math.max(0, endMs - startMs) : 15 * 60000,
            source: 'timeline',
          });
          totalPoints++;
        }
      }

      // 3. activity / activitySegment
      if (seg.activity || seg.activitySegment) {
        const act = seg.activity || seg.activitySegment;
        const startLoc = act.start?.latLng || (act.startLocation?.latitudeE7 ? `${act.startLocation.latitudeE7 / 1e7}, ${act.startLocation.longitudeE7 / 1e7}` : null);
        const endLoc = act.end?.latLng || (act.endLocation?.latitudeE7 ? `${act.endLocation.latitudeE7 / 1e7}, ${act.endLocation.longitudeE7 / 1e7}` : null);

        const startCoord = parseCoordinateString(startLoc);
        const endCoord = parseCoordinateString(endLoc);
        const startMs = parseTimestamp(seg.startTime || act.duration?.startTimestamp);
        const endMs = parseTimestamp(seg.endTime || act.duration?.endTimestamp);

        if (startCoord && startMs) {
          trip.points.push({ lat: startCoord.lat, lng: startCoord.lng, timestampMs: startMs, source: 'activity-start' });
          totalPoints++;
        }
        if (endCoord && endMs) {
          trip.points.push({ lat: endCoord.lat, lng: endCoord.lng, timestampMs: endMs, source: 'activity-end' });
          totalPoints++;
        }
      }
    }

    // Filter non-empty valid days (at least 3 points)
    const validTrips = Array.from(tripsByDate.values())
      .filter((t) => t.points.length >= 3)
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort newest date first

    if (validTrips.length === 0) {
      throw new Error('No valid location coordinates found in this file.');
    }

    // Convert top 60 recent journey days into normalized trips
    const candidateTrips = validTrips.slice(0, 60).map((t) => {
      const d = new Date(t.date + 'T00:00:00');
      const dateFormatted = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const title = `Timeline — ${dateFormatted}`;
      return segmentPointsIntoTrip(t.points, title, t.visits);
    });

    return {
      trips: candidateTrips,
      format: 'Google Timeline (semanticSegments)',
      totalPointsParsed: totalPoints,
    };
  }

  // Legacy Google Takeout Records.json
  if (jsonData.locations && Array.isArray(jsonData.locations)) {
    const rawPoints = parseGoogleTakeoutRecords(jsonData);
    if (rawPoints.length === 0) {
      throw new Error('No valid location points found in Records.json');
    }
    const singleTrip = segmentPointsIntoTrip(rawPoints.slice(0, 2000), fileName || 'Takeout Records Journey');
    return {
      trips: [singleTrip],
      format: 'Google Takeout Records.json',
      totalPointsParsed: rawPoints.length,
    };
  }

  throw new Error('Unrecognized timeline format. Please upload a Google Timeline.json or Records.json file.');
}
