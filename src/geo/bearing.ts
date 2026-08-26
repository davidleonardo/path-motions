import { Coordinate } from '../domain/timeline';
import { degreesToRadians, radiansToDegrees } from './distance';

/**
 * Calculates the forward initial bearing from c1 to c2 in degrees [0, 360).
 */
export function calculateBearingDeg(c1: Coordinate, c2: Coordinate): number {
  const lat1 = degreesToRadians(c1.lat);
  const lat2 = degreesToRadians(c2.lat);
  const dLng = degreesToRadians(c2.lng - c1.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let brng = radiansToDegrees(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Computes shortest angle difference between two angles in degrees (-180 to +180).
 */
export function shortestAngleDiffDeg(fromDeg: number, toDeg: number): number {
  let diff = (toDeg - fromDeg) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * Smooths and clamps the change in bearing to prevent sudden spinning.
 */
export function interpolateBearingDeg(
  currentBearing: number,
  targetBearing: number,
  t: number,
  maxAngularSpeedDeg?: number
): number {
  const diff = shortestAngleDiffDeg(currentBearing, targetBearing);
  let step = diff * t;
  
  if (maxAngularSpeedDeg !== undefined) {
    step = Math.max(-maxAngularSpeedDeg, Math.min(maxAngularSpeedDeg, step));
  }

  return (currentBearing + step + 360) % 360;
}
