import { CameraState, EasingType } from '../domain/camera';
import { interpolateBearingDeg } from '../geo/bearing';
import { interpolateCoordinate } from '../geo/distance';

export function evaluateEasing(t: number, easing: EasingType = 'easeInOutCubic'): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'linear':
      return clamped;
    case 'easeInOutQuad':
      return clamped < 0.5 ? 2 * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
    case 'easeInOutCubic':
      return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
    case 'easeOutCubic':
      return 1 - Math.pow(1 - clamped, 3);
    case 'easeInOutQuint':
      return clamped < 0.5 ? 16 * Math.pow(clamped, 5) : 1 - Math.pow(-2 * clamped + 2, 5) / 2;
    default:
      return clamped;
  }
}

export function interpolateCameraState(
  c1: CameraState,
  c2: CameraState,
  t: number,
  easing: EasingType = 'easeInOutCubic'
): CameraState {
  const easedT = evaluateEasing(t, easing);
  return {
    center: interpolateCoordinate(c1.center, c2.center, easedT),
    zoom: c1.zoom + (c2.zoom - c1.zoom) * easedT,
    pitch: c1.pitch + (c2.pitch - c1.pitch) * easedT,
    bearing: interpolateBearingDeg(c1.bearing, c2.bearing, easedT),
  };
}
