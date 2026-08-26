import { Coordinate } from '../domain/timeline';

const EARTH_RADIUS_M = 6371008.8;

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculates the great-circle distance between two coordinates in meters (Haversine formula).
 */
export function calculateDistanceM(c1: Coordinate, c2: Coordinate): number {
  const dLat = degreesToRadians(c2.lat - c1.lat);
  const dLng = degreesToRadians(c2.lng - c1.lng);
  const lat1 = degreesToRadians(c1.lat);
  const lat2 = degreesToRadians(c2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * Computes the bounding box [minLng, minLat, maxLng, maxLat] from an array of coordinates.
 */
export function computeBounds(coords: Coordinate[]): [number, number, number, number] {
  if (coords.length === 0) {
    return [0, 0, 0, 0];
  }

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const c of coords) {
    if (c.lng < minLng) minLng = c.lng;
    if (c.lat < minLat) minLat = c.lat;
    if (c.lng > maxLng) maxLng = c.lng;
    if (c.lat > maxLat) maxLat = c.lat;
  }

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Computes the geographical center of an array of coordinates.
 */
export function computeCenter(coords: Coordinate[]): Coordinate {
  if (coords.length === 0) {
    return { lat: 0, lng: 0 };
  }
  const bounds = computeBounds(coords);
  return {
    lng: (bounds[0] + bounds[2]) / 2,
    lat: (bounds[1] + bounds[3]) / 2,
  };
}

/**
 * Interpolates linearly between two coordinates with t in [0..1]
 */
export function interpolateCoordinate(c1: Coordinate, c2: Coordinate, t: number): Coordinate {
  return {
    lat: c1.lat + (c2.lat - c1.lat) * t,
    lng: c1.lng + (c2.lng - c1.lng) * t,
  };
}
