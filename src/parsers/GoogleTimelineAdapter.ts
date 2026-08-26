import { PlaceVisit } from '../domain/timeline';

export interface RawParsedPoint {
  lat: number;
  lng: number;
  timestampMs: number;
  accuracyM?: number;
  source: string;
}

export function parseGoogleTimelineOnDevice(data: any): {
  points: RawParsedPoint[];
  visits: PlaceVisit[];
} {
  const points: RawParsedPoint[] = [];
  const visits: PlaceVisit[] = [];

  const objects = Array.isArray(data)
    ? data
    : data.timelineObjects || data.semanticSegments || [];

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];

    // Activity Segment (Movement)
    if (obj.activitySegment) {
      const act = obj.activitySegment;
      const startMs = parseTimestamp(act.duration?.startTimestamp || act.duration?.startTimestampMs);
      const endMs = parseTimestamp(act.duration?.endTimestamp || act.duration?.endTimestampMs);

      // Start & end location
      if (act.startLocation?.latitudeE7 && act.startLocation?.longitudeE7 && startMs) {
        points.push({
          lat: act.startLocation.latitudeE7 / 1e7,
          lng: act.startLocation.longitudeE7 / 1e7,
          timestampMs: startMs,
          source: 'activity-start',
        });
      }

      // Simplified raw path / waypoint path
      if (Array.isArray(act.waypointPath?.waypoints)) {
        const waypoints = act.waypointPath.waypoints;
        const count = waypoints.length;
        const timeStep = count > 1 && startMs && endMs ? (endMs - startMs) / (count + 1) : 1000;

        waypoints.forEach((wp: any, wpIdx: number) => {
          if (wp.latE7 && wp.lngE7) {
            points.push({
              lat: wp.latE7 / 1e7,
              lng: wp.lngE7 / 1e7,
              timestampMs: startMs ? startMs + (wpIdx + 1) * timeStep : Date.now(),
              source: 'waypoint',
            });
          }
        });
      }

      if (act.endLocation?.latitudeE7 && act.endLocation?.longitudeE7 && endMs) {
        points.push({
          lat: act.endLocation.latitudeE7 / 1e7,
          lng: act.endLocation.longitudeE7 / 1e7,
          timestampMs: endMs,
          source: 'activity-end',
        });
      }
    }

    // Place Visit (Stop)
    if (obj.placeVisit) {
      const pv = obj.placeVisit;
      const loc = pv.location || {};
      const lat = (loc.latitudeE7 || 0) / 1e7;
      const lng = (loc.longitudeE7 || 0) / 1e7;
      const startMs = parseTimestamp(pv.duration?.startTimestamp || pv.duration?.startTimestampMs);
      const endMs = parseTimestamp(pv.duration?.endTimestamp || pv.duration?.endTimestampMs);

      if (lat && lng && startMs) {
        const placeName = loc.name || loc.address || `Place #${visits.length + 1}`;
        points.push({
          lat,
          lng,
          timestampMs: startMs,
          source: 'place-arrival',
        });
        if (endMs) {
          points.push({
            lat,
            lng,
            timestampMs: endMs,
            source: 'place-departure',
          });
        }

        visits.push({
          id: `visit-${visits.length + 1}`,
          name: placeName,
          address: loc.address,
          coordinate: { lat, lng },
          arrivalMs: startMs,
          departureMs: endMs || startMs + 10 * 60 * 1000,
          durationMs: endMs ? Math.max(0, endMs - startMs) : 10 * 60 * 1000,
          source: 'timeline',
        });
      }
    }
  }

  // Also check rawSignals if present
  if (Array.isArray(data.rawSignals)) {
    data.rawSignals.forEach((sig: any) => {
      if (sig.position?.lat && sig.position?.lng && sig.timestamp) {
        points.push({
          lat: sig.position.lat,
          lng: sig.position.lng,
          timestampMs: parseTimestamp(sig.timestamp),
          accuracyM: sig.position.accuracyMeters,
          source: 'rawSignal',
        });
      }
    });
  }

  return { points, visits };
}

function parseTimestamp(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const parsed = Date.parse(val);
  return isNaN(parsed) ? 0 : parsed;
}
