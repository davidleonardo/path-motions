import { RawParsedPoint } from './GoogleTimelineAdapter';

export function parseGoogleTakeoutRecords(data: any): RawParsedPoint[] {
  const points: RawParsedPoint[] = [];
  const locations = data.locations || [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    let lat: number | undefined;
    let lng: number | undefined;

    if (typeof loc.latitudeE7 === 'number') {
      lat = loc.latitudeE7 / 1e7;
    } else if (typeof loc.latitude === 'number') {
      lat = loc.latitude;
    }

    if (typeof loc.longitudeE7 === 'number') {
      lng = loc.longitudeE7 / 1e7;
    } else if (typeof loc.longitude === 'number') {
      lng = loc.longitude;
    }

    let timestampMs = 0;
    if (typeof loc.timestampMs === 'number' || typeof loc.timestampMs === 'string') {
      timestampMs = Number(loc.timestampMs);
    } else if (loc.timestamp) {
      timestampMs = Date.parse(loc.timestamp);
    }

    if (lat !== undefined && lng !== undefined && !isNaN(timestampMs) && timestampMs > 0) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        points.push({
          lat,
          lng,
          timestampMs,
          accuracyM: typeof loc.accuracy === 'number' ? loc.accuracy : undefined,
          source: 'records',
        });
      }
    }
  }

  return points;
}
