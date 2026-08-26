import { CameraState } from '../domain/camera';
import { NormalizedTrip } from '../domain/timeline';
import { Scene } from '../domain/scene';
import { sampleRouteAtProgress } from '../geo/interpolation';
import { interpolateCameraState } from './CameraInterpolator';
import { AnimationMode, CameraMovement } from '../stores/projectStore';

export class CameraDirector {
  public static calculateOverviewZoom(bounds: [number, number, number, number]): number {
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const latSpan = Math.max(0.001, maxLat - minLat);
    const lngSpan = Math.max(0.001, maxLng - minLng);
    const maxSpan = Math.max(latSpan, lngSpan);

    // Zoom base calculation with +20% closer framing
    if (maxSpan > 15) return 4.4;
    if (maxSpan > 8) return 5.9;
    if (maxSpan > 3) return 7.5;
    if (maxSpan > 1) return 9.0;
    if (maxSpan > 0.3) return 11.0;
    if (maxSpan > 0.08) return 13.0;
    if (maxSpan > 0.02) return 14.6;
    return 15.6;
  }

  public static evaluateCamera(
    trip: NormalizedTrip,
    progress: number,
    scene: Scene,
    sceneProgress: number,
    defaultPitch: number = 50,
    animationMode: AnimationMode = 'simple',
    cameraMovement: CameraMovement = 'steady',
    zoomOffset: number = 0.4
  ): CameraState {
    const overviewZoom = this.calculateOverviewZoom(trip.bounds) + zoomOffset;

    // 1. SIMPLE 2D MODE (Ahn-Lab style: Flat, calm, no spinning)
    if (animationMode === 'simple') {
      if (cameraMovement === 'fixed') {
        // Fixed overview: Map doesn't move, full path visible, dot moves along path
        return {
          center: trip.center,
          zoom: Math.max(2, overviewZoom),
          pitch: 0,
          bearing: 0,
        };
      }

      // Steady Following: Flat 2D, centers gently on current position
      const sample = sampleRouteAtProgress(trip.points, progress, true);
      const followZoom = Math.max(overviewZoom + 1.8, Math.min(16.2, overviewZoom + 3.8));

      return {
        center: sample.coordinate,
        zoom: followZoom,
        pitch: cameraMovement === 'dynamic' ? 15 : 0,
        bearing: 0,
      };
    }

    // 2. CINEMATIC 3D MODE (Dramatic director, pitch, orbit)
    if (scene.type === 'intro-overview') {
      const startOverview: CameraState = {
        center: trip.center,
        zoom: overviewZoom,
        pitch: 20,
        bearing: 0,
      };
      const firstPoint = trip.points[0]?.coordinate || trip.center;
      const zoomTarget: CameraState = {
        center: firstPoint,
        zoom: Math.min(16.5, overviewZoom + 4.2),
        pitch: defaultPitch,
        bearing: trip.points[0]?.visualBearingDeg || 0,
      };
      return interpolateCameraState(startOverview, zoomTarget, sceneProgress, 'easeInOutCubic');
    }

    if (scene.type === 'outro-summary') {
      const lastPoint = trip.points[trip.points.length - 1]?.coordinate || trip.center;
      const endState: CameraState = {
        center: lastPoint,
        zoom: Math.min(16.5, overviewZoom + 3.2),
        pitch: defaultPitch,
        bearing: trip.points[trip.points.length - 1]?.visualBearingDeg || 0,
      };
      const fullOverview: CameraState = {
        center: trip.center,
        zoom: overviewZoom,
        pitch: 25,
        bearing: 0,
      };
      return interpolateCameraState(endState, fullOverview, sceneProgress, 'easeInOutCubic');
    }

    if (scene.type === 'orbit-stop' && scene.associatedVisit) {
      const stopCoord = scene.associatedVisit.coordinate;
      const orbitBearing = (scene.associatedVisit.arrivalMs % 360) + sceneProgress * 45;
      return {
        center: stopCoord,
        zoom: 16.0 + zoomOffset,
        pitch: 45,
        bearing: orbitBearing % 360,
      };
    }

    // Follow & Chase in Cinematic mode
    const sample = sampleRouteAtProgress(trip.points, progress, true);
    const lookAheadProgress = Math.min(1, progress + 0.025);
    const lookAheadSample = sampleRouteAtProgress(trip.points, lookAheadProgress, true);

    const speedZoomOffset = Math.max(-1.5, Math.min(0.5, 0.5 - sample.speedKmh / 120));
    const dynamicZoom = 15.2 + zoomOffset + speedZoomOffset;

    let targetBearing = sample.visualBearingDeg;

    return {
      center: lookAheadSample.coordinate,
      zoom: dynamicZoom,
      pitch: defaultPitch,
      bearing: targetBearing,
    };
  }
}
