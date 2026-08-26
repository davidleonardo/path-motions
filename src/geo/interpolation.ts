import { Coordinate, RouteSample } from '../domain/timeline';
import { interpolateCoordinate } from './distance';

/**
 * Centripetal Catmull-Rom Spline interpolation for 4 control points P0, P1, P2, P3.
 * t is normalized 0..1 between P1 and P2.
 */
export function catmullRomInterpolate(
  p0: Coordinate,
  p1: Coordinate,
  p2: Coordinate,
  p3: Coordinate,
  t: number,
  alpha: number = 0.5 // 0.5 for Centripetal Catmull-Rom
): Coordinate {
  function getT(tPrev: number, pA: Coordinate, pB: Coordinate) {
    const d = Math.hypot(pB.lng - pA.lng, pB.lat - pA.lat);
    return tPrev + Math.pow(Math.max(d, 1e-6), alpha);
  }

  const t0 = 0;
  const t1 = getT(t0, p0, p1);
  const t2 = getT(t1, p1, p2);
  const t3 = getT(t2, p2, p3);

  const tVal = t1 + t * (t2 - t1);

  // Helper for linear combination
  function evalParam(val0: number, val1: number, val2: number, val3: number): number {
    const a1 = ((t1 - tVal) / (t1 - t0)) * val0 + ((tVal - t0) / (t1 - t0)) * val1;
    const a2 = ((t2 - tVal) / (t2 - t1)) * val1 + ((tVal - t1) / (t2 - t1)) * val2;
    const a3 = ((t3 - tVal) / (t3 - t2)) * val2 + ((tVal - t2) / (t3 - t2)) * val3;

    const b1 = ((t2 - tVal) / (t2 - t0)) * a1 + ((tVal - t0) / (t2 - t0)) * a2;
    const b2 = ((t3 - tVal) / (t3 - t1)) * a2 + ((tVal - t1) / (t3 - t1)) * a3;

    const c = ((t2 - tVal) / (t2 - t1)) * b1 + ((tVal - t1) / (t2 - t1)) * b2;
    return c;
  }

  return {
    lat: evalParam(p0.lat, p1.lat, p2.lat, p3.lat),
    lng: evalParam(p0.lng, p1.lng, p2.lng, p3.lng),
  };
}

/**
 * Finds the exact point along a route at normalized progress 0..1 or timestamp.
 */
export function sampleRouteAtProgress(
  points: RouteSample[],
  progress: number,
  useSmoothing: boolean = true
): {
  coordinate: Coordinate;
  rawBearingDeg: number;
  visualBearingDeg: number;
  speedKmh: number;
  cumulativeDistanceM: number;
  sourceTimestampMs: number;
  index: number;
} {
  if (points.length === 0) {
    return {
      coordinate: { lat: 0, lng: 0 },
      rawBearingDeg: 0,
      visualBearingDeg: 0,
      speedKmh: 0,
      cumulativeDistanceM: 0,
      sourceTimestampMs: 0,
      index: 0,
    };
  }

  if (points.length === 1 || progress <= 0) {
    const p = points[0];
    return {
      coordinate: p.coordinate,
      rawBearingDeg: p.rawBearingDeg,
      visualBearingDeg: p.visualBearingDeg,
      speedKmh: p.speedKmh,
      cumulativeDistanceM: 0,
      sourceTimestampMs: p.timestampMs,
      index: 0,
    };
  }

  if (progress >= 1) {
    const p = points[points.length - 1];
    return {
      coordinate: p.coordinate,
      rawBearingDeg: p.rawBearingDeg,
      visualBearingDeg: p.visualBearingDeg,
      speedKmh: p.speedKmh,
      cumulativeDistanceM: p.cumulativeDistanceM,
      sourceTimestampMs: p.timestampMs,
      index: points.length - 1,
    };
  }

  const totalDistance = points[points.length - 1].cumulativeDistanceM;
  const targetDistance = progress * totalDistance;

  // Binary search to find segment
  let low = 0;
  let high = points.length - 1;
  while (low < high - 1) {
    const mid = (low + high) >> 1;
    if (points[mid].cumulativeDistanceM <= targetDistance) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const p1 = points[low];
  const p2 = points[high];
  const segmentLen = p2.cumulativeDistanceM - p1.cumulativeDistanceM;
  const t = segmentLen > 0 ? (targetDistance - p1.cumulativeDistanceM) / segmentLen : 0;

  let coord: Coordinate;
  if (useSmoothing && low > 0 && high < points.length - 1) {
    const p0 = points[low - 1];
    const p3 = points[high + 1];
    coord = catmullRomInterpolate(p0.coordinate, p1.coordinate, p2.coordinate, p3.coordinate, t);
  } else {
    coord = interpolateCoordinate(p1.coordinate, p2.coordinate, t);
  }

  const speedKmh = p1.speedKmh + (p2.speedKmh - p1.speedKmh) * t;
  const sourceTimestampMs = Math.round(p1.timestampMs + (p2.timestampMs - p1.timestampMs) * t);

  return {
    coordinate: coord,
    rawBearingDeg: p1.rawBearingDeg,
    visualBearingDeg: p1.visualBearingDeg,
    speedKmh: Math.max(0, speedKmh),
    cumulativeDistanceM: targetDistance,
    sourceTimestampMs,
    index: low,
  };
}
