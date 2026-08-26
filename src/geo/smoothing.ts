import { RouteSample } from '../domain/timeline';
import { calculateBearingDeg, shortestAngleDiffDeg } from './bearing';

/**
 * Computes stabilized visual bearing across route samples using forward lookahead
 * and exponential moving average to prevent camera jitter.
 */
export function computeStabilizedBearings(points: RouteSample[], lookAheadSamples: number = 3): RouteSample[] {
  if (points.length < 2) return points;

  let currentBearing = points[0].rawBearingDeg;

  return points.map((p, idx) => {
    // Look ahead multiple points
    const nextIdx = Math.min(points.length - 1, idx + lookAheadSamples);
    const targetBearing = calculateBearingDeg(p.coordinate, points[nextIdx].coordinate);

    const diff = shortestAngleDiffDeg(currentBearing, targetBearing);
    // Smooth factor 0.35
    currentBearing = (currentBearing + diff * 0.35 + 360) % 360;

    return {
      ...p,
      visualBearingDeg: currentBearing,
    };
  });
}
