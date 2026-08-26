import { PrivacyZone, RouteSample } from '../domain/timeline';
import { calculateDistanceM } from './distance';

/**
 * Applies privacy zones to filter or trim private coordinate areas (e.g. near home or office).
 */
export function applyPrivacyZones(points: RouteSample[], privacyZones: PrivacyZone[]): RouteSample[] {
  if (!privacyZones || privacyZones.length === 0) return points;

  return points.filter((p) => {
    for (const zone of privacyZones) {
      const dist = calculateDistanceM(zone.coordinate, p.coordinate);
      if (dist <= zone.radiusM) {
        return false; // redact/hide point
      }
    }
    return true;
  });
}
