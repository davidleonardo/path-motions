import { PlaceVisit, RouteSample } from '../domain/timeline';
import { calculateDistanceM, computeCenter } from './distance';

interface DwellCluster {
  points: RouteSample[];
  startMs: number;
  endMs: number;
}

/**
 * Detects place stops and dwell times along a sequence of route samples.
 * Groups stationary samples within stopRadiusM for >= minDwellMinutes.
 */
export function detectStopsFromSamples(
  points: RouteSample[],
  stopRadiusM: number = 80,
  minDwellMinutes: number = 5
): PlaceVisit[] {
  if (points.length < 5) return [];

  const minDwellMs = minDwellMinutes * 60 * 1000;
  const clusters: DwellCluster[] = [];
  let currentCluster: RouteSample[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const clusterCenter = computeCenter(currentCluster.map((c) => c.coordinate));
    const dist = calculateDistanceM(clusterCenter, p.coordinate);

    if (dist <= stopRadiusM) {
      currentCluster.push(p);
    } else {
      if (currentCluster.length > 1) {
        const startMs = currentCluster[0].timestampMs;
        const endMs = currentCluster[currentCluster.length - 1].timestampMs;
        if (endMs - startMs >= minDwellMs) {
          clusters.push({ points: [...currentCluster], startMs, endMs });
        }
      }
      currentCluster = [p];
    }
  }

  // Check last cluster
  if (currentCluster.length > 1) {
    const startMs = currentCluster[0].timestampMs;
    const endMs = currentCluster[currentCluster.length - 1].timestampMs;
    if (endMs - startMs >= minDwellMs) {
      clusters.push({ points: [...currentCluster], startMs, endMs });
    }
  }

  return clusters.map((cluster, idx) => {
    const center = computeCenter(cluster.points.map((p) => p.coordinate));
    const durationMs = cluster.endMs - cluster.startMs;
    return {
      id: `stop-${idx + 1}-${cluster.startMs}`,
      name: idx === 0 ? 'Starting Location' : idx === clusters.length - 1 ? 'Final Destination' : `Stop #${idx + 1}`,
      coordinate: center,
      arrivalMs: cluster.startMs,
      departureMs: cluster.endMs,
      durationMs,
      source: 'detected',
    };
  });
}
