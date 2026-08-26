import { NormalizedTrip, RouteSample, TripSegment, PlaceVisit } from '../domain/timeline';
import { calculateBearingDeg } from './bearing';
import { calculateDistanceM, computeBounds, computeCenter } from './distance';
import { computeStabilizedBearings } from './smoothing';
import { detectStopsFromSamples } from './stopDetection';

/**
 * Segments an array of raw timeline points into a structured NormalizedTrip.
 */
export function segmentPointsIntoTrip(
  rawPoints: { lat: number; lng: number; timestampMs: number; accuracyM?: number }[],
  title: string = 'My Journey',
  explicitVisits: PlaceVisit[] = []
): NormalizedTrip {
  if (rawPoints.length === 0) {
    return {
      id: `trip-${Date.now()}`,
      title,
      timezone: 'UTC',
      startMs: 0,
      endMs: 0,
      totalDurationMs: 0,
      totalDistanceM: 0,
      points: [],
      segments: [],
      visits: [],
      bounds: [0, 0, 0, 0],
      center: { lat: 0, lng: 0 },
      rawPointCount: 0,
    };
  }

  // Sort by timestamp
  const sorted = [...rawPoints].sort((a, b) => a.timestampMs - b.timestampMs);

  const startMs = sorted[0].timestampMs;
  const endMs = sorted[sorted.length - 1].timestampMs;
  let cumulativeDistanceM = 0;

  const samples: RouteSample[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;

    let segmentDist = 0;
    let speedKmh = 0;
    let bearing = 0;

    if (prev) {
      segmentDist = calculateDistanceM(prev, curr);
      cumulativeDistanceM += segmentDist;
      const dtHours = Math.max(1e-5, (curr.timestampMs - prev.timestampMs) / 3600000);
      speedKmh = Math.min(300, (segmentDist / 1000) / dtHours);
      bearing = calculateBearingDeg(prev, curr);
    }

    samples.push({
      id: `pt-${i}`,
      coordinate: { lat: curr.lat, lng: curr.lng },
      timestampMs: curr.timestampMs,
      accuracyM: curr.accuracyM,
      sourceIndex: i,
      elapsedMs: curr.timestampMs - startMs,
      segmentDistanceM: segmentDist,
      cumulativeDistanceM,
      speedKmh,
      rawBearingDeg: bearing,
      visualBearingDeg: bearing,
      mode: speedKmh > 70 ? 'car' : speedKmh > 20 ? 'cycling' : 'walking',
    });
  }

  // Stabilize bearings
  const stabilizedSamples = computeStabilizedBearings(samples);

  // Detect stops if no explicit place visits
  const visits = explicitVisits.length > 0 ? explicitVisits : detectStopsFromSamples(stabilizedSamples);

  const bounds = computeBounds(stabilizedSamples.map((s) => s.coordinate));
  const center = computeCenter(stabilizedSamples.map((s) => s.coordinate));

  const mainSegment: TripSegment = {
    id: 'seg-main',
    startMs,
    endMs,
    mode: 'car',
    points: stabilizedSamples,
    distanceM: cumulativeDistanceM,
    durationMs: endMs - startMs,
    avgSpeedKmh: cumulativeDistanceM > 0 && endMs > startMs ? (cumulativeDistanceM / 1000) / ((endMs - startMs) / 3600000) : 0,
  };

  return {
    id: `trip-${startMs}`,
    title,
    timezone: 'Local',
    startMs,
    endMs,
    totalDurationMs: endMs - startMs,
    totalDistanceM: cumulativeDistanceM,
    points: stabilizedSamples,
    segments: [mainSegment],
    visits,
    bounds,
    center,
    rawPointCount: rawPoints.length,
  };
}
