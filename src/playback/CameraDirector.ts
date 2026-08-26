import { CameraState } from '../domain/camera';
import { NormalizedTrip } from '../domain/timeline';
import { Scene } from '../domain/scene';
import { calculateBearingDeg } from '../geo/bearing';
import { sampleRouteAtProgress } from '../geo/interpolation';
import { interpolateCameraState } from './CameraInterpolator';

export class CameraDirector {
  /**
   * Calculates ideal zoom level based on bounding box or route span.
   */
  public static calculateOverviewZoom(bounds: [number, number, number, number]): number {
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const latSpan = Math.max(0.001, maxLat - minLat);
    const lngSpan = Math.max(0.001, maxLng - minLng);
    const maxSpan = Math.max(latSpan, lngSpan);

    if (maxSpan > 10) return 4.5;
    if (maxSpan > 5) return 6;
    if (maxSpan > 2) return 8;
    if (maxSpan > 0.5) return 10;
    if (maxSpan > 0.1) return 12;
    if (maxSpan > 0.02) return 14;
    return 15.5;
  }

  /**
   * Calculates camera state for a given route progress and active scene.
   */
  public static evaluateCamera(
    trip: NormalizedTrip,
    progress: number,
    scene: Scene,
    sceneProgress: number,
    defaultPitch: number = 50
  ): CameraState {
    const overviewZoom = this.calculateOverviewZoom(trip.bounds);

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
        zoom: Math.min(16, overviewZoom + 4),
        pitch: defaultPitch,
        bearing: trip.points[0]?.visualBearingDeg || 0,
      };
      return interpolateCameraState(startOverview, zoomTarget, sceneProgress, 'easeInOutCubic');
    }

    if (scene.type === 'outro-summary') {
      const lastPoint = trip.points[trip.points.length - 1]?.coordinate || trip.center;
      const endState: CameraState = {
        center: lastPoint,
        zoom: Math.min(16, overviewZoom + 3),
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
      // Orbit around stop coord (rotation from -20 to +25 deg)
      const orbitBearing = (scene.associatedVisit.arrivalMs % 360) + sceneProgress * 45;
      return {
        center: stopCoord,
        zoom: 15.5,
        pitch: 45,
        bearing: orbitBearing % 360,
      };
    }

    // Follow & Chase camera modes
    const sample = sampleRouteAtProgress(trip.points, progress, true);
    // Look-ahead coordinate along route to position marker lower-center
    const lookAheadProgress = Math.min(1, progress + 0.025);
    const lookAheadSample = sampleRouteAtProgress(trip.points, lookAheadProgress, true);

    // Dynamic zoom based on speed: higher speed -> slightly zoom out
    const speedZoomOffset = Math.max(-1.5, Math.min(0.5, 0.5 - (sample.speedKmh / 120)));
    const dynamicZoom = 14.8 + speedZoomOffset;

    // Bearing aligned with movement direction
    let targetBearing = calculateBearingDeg(sample.coordinate, lookAheadSample.coordinate);
    if (isNaN(targetBearing)) targetBearing = sample.visualBearingDeg;

    return {
      center: lookAheadSample.coordinate,
      zoom: dynamicZoom,
      pitch: defaultPitch,
      bearing: targetBearing,
    };
  }
}
