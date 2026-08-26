import { PlaceVisit } from '../domain/timeline';

export interface RawParsedPoint {
  lat: number;
  lng: number;
  timestampMs: number;
  accuracyM?: number;
  source: string;
}

export function parseCoordinateString(str: any): { lat: number; lng: number } | null {
  if (!str) return null;
  if (typeof str === 'object' && 'lat' in str && 'lng' in str) {
    return { lat: Number(str.lat), lng: Number(str.lng) };
  }
  if (typeof str !== 'string') return null;

  // Format: "-6.191635°, 106.86151°" or "geo:-6.191635,106.86151" or "-6.191635, 106.86151"
  const clean = str.replace(/°/g, '').replace(/geo:/g, '').trim();
  const parts = clean.split(',');
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

export function parseTimestamp(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const parsed = Date.parse(val);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseGoogleTimelineOnDevice(data: any): {
  points: RawParsedPoint[];
  visits: PlaceVisit[];
} {
  const points: RawParsedPoint[] = [];
  const visits: PlaceVisit[] = [];

  const segments = Array.isArray(data)
    ? data
    : data.semanticSegments || data.timelineObjects || [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    // 1. timelinePath (array of path waypoints with time)
    if (Array.isArray(seg.timelinePath)) {
      for (const item of seg.timelinePath) {
        const coord = parseCoordinateString(item.point || item.latLng || item.position);
        const ts = parseTimestamp(item.time || item.timestamp);
        if (coord && ts) {
          points.push({ lat: coord.lat, lng: coord.lng, timestampMs: ts, source: 'timelinePath' });
        }
      }
    }

    // 2. visit / placeVisit (stop)
    if (seg.visit || seg.placeVisit) {
      const v = seg.visit || seg.placeVisit;
      const locStr =
        v.topCandidate?.placeLocation?.latLng ||
        v.location?.latitudeE7 !== undefined
          ? `${v.location.latitudeE7 / 1e7}, ${v.location.longitudeE7 / 1e7}`
          : v.location?.latLng || v.location?.name;

      const coord = parseCoordinateString(locStr);
      const startMs = parseTimestamp(seg.startTime || v.duration?.startTimestamp);
      const endMs = parseTimestamp(seg.endTime || v.duration?.endTimestamp);

      if (coord && startMs) {
        const placeName =
          v.topCandidate?.semanticType ||
          v.location?.name ||
          v.location?.address ||
          `Visit #${visits.length + 1}`;

        points.push({ lat: coord.lat, lng: coord.lng, timestampMs: startMs, source: 'visit-arrival' });
        if (endMs && endMs > startMs) {
          points.push({ lat: coord.lat, lng: coord.lng, timestampMs: endMs, source: 'visit-departure' });
        }

        visits.push({
          id: `visit-${visits.length + 1}-${startMs}`,
          name: placeName,
          coordinate: coord,
          arrivalMs: startMs,
          departureMs: endMs || startMs + 15 * 60 * 1000,
          durationMs: endMs ? Math.max(0, endMs - startMs) : 15 * 60 * 1000,
          source: 'timeline',
        });
      }
    }

    // 3. activity / activitySegment (movement)
    if (seg.activity || seg.activitySegment) {
      const act = seg.activity || seg.activitySegment;
      const startLoc =
        act.start?.latLng ||
        (act.startLocation?.latitudeE7 ? `${act.startLocation.latitudeE7 / 1e7}, ${act.startLocation.longitudeE7 / 1e7}` : null);
      const endLoc =
        act.end?.latLng ||
        (act.endLocation?.latitudeE7 ? `${act.endLocation.latitudeE7 / 1e7}, ${act.endLocation.longitudeE7 / 1e7}` : null);

      const startCoord = parseCoordinateString(startLoc);
      const endCoord = parseCoordinateString(endLoc);
      const startMs = parseTimestamp(seg.startTime || act.duration?.startTimestamp);
      const endMs = parseTimestamp(seg.endTime || act.duration?.endTimestamp);

      if (startCoord && startMs) {
        points.push({ lat: startCoord.lat, lng: startCoord.lng, timestampMs: startMs, source: 'activity-start' });
      }

      if (Array.isArray(act.waypointPath?.waypoints)) {
        const waypoints = act.waypointPath.waypoints;
        const count = waypoints.length;
        const timeStep = count > 1 && startMs && endMs ? (endMs - startMs) / (count + 1) : 1000;

        waypoints.forEach((wp: any, wpIdx: number) => {
          const wpCoord = wp.latE7 && wp.lngE7 ? { lat: wp.latE7 / 1e7, lng: wp.lngE7 / 1e7 } : parseCoordinateString(wp.latLng || wp.point);
          if (wpCoord && startMs) {
            points.push({
              lat: wpCoord.lat,
              lng: wpCoord.lng,
              timestampMs: startMs + (wpIdx + 1) * timeStep,
              source: 'waypoint',
            });
          }
        });
      }

      if (endCoord && endMs) {
        points.push({ lat: endCoord.lat, lng: endCoord.lng, timestampMs: endMs, source: 'activity-end' });
      }
    }

    // 4. rawSignals inside segments
    if (Array.isArray(seg.rawSignals)) {
      for (const sig of seg.rawSignals) {
        const coord = parseCoordinateString(sig.position?.latLng) || (sig.position?.lat && sig.position?.lng ? { lat: sig.position.lat, lng: sig.position.lng } : null);
        const ts = parseTimestamp(sig.timestamp);
        if (coord && ts) {
          points.push({
            lat: coord.lat,
            lng: coord.lng,
            timestampMs: ts,
            accuracyM: sig.position?.accuracyMeters,
            source: 'rawSignal',
          });
        }
      }
    }
  }

  // 5. Global rawSignals at root level
  if (Array.isArray(data.rawSignals)) {
    for (const sig of data.rawSignals) {
      const coord = parseCoordinateString(sig.position?.latLng) || (sig.position?.lat && sig.position?.lng ? { lat: sig.position.lat, lng: sig.position.lng } : null);
      const ts = parseTimestamp(sig.timestamp);
      if (coord && ts) {
        points.push({
          lat: coord.lat,
          lng: coord.lng,
          timestampMs: ts,
          accuracyM: sig.position?.accuracyMeters,
          source: 'rawSignal',
        });
      }
    }
  }

  return { points, visits };
}
