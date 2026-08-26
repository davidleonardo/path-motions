import { NormalizedTrip, PlaceVisit } from '../domain/timeline';
import { PlaybackState, Scene } from '../domain/scene';
import { sampleRouteAtProgress } from '../geo/interpolation';
import { CameraDirector } from './CameraDirector';
import { SceneDirector } from './SceneDirector';

export class TimelineEngine {
  private trip: NormalizedTrip;
  private totalDurationSec: number;
  private scenes: Scene[];
  private defaultPitch: number;

  constructor(trip: NormalizedTrip, totalDurationSec: number = 30, defaultPitch: number = 50) {
    this.trip = trip;
    this.totalDurationSec = Math.max(5, totalDurationSec);
    this.defaultPitch = defaultPitch;
    this.scenes = SceneDirector.generateScenes(trip, this.totalDurationSec);
  }

  public getScenes(): Scene[] {
    return this.scenes;
  }

  public getTotalDurationSec(): number {
    return this.totalDurationSec;
  }

  /**
   * Deterministically evaluates the complete state of the animation at any second t in [0..totalDurationSec].
   * This is used identically by both the live Preview player and the Video Export renderer.
   */
  public evaluate(videoTimeSec: number): PlaybackState {
    const clampedTime = Math.max(0, Math.min(this.totalDurationSec, videoTimeSec));

    // Find active scene
    let activeScene = this.scenes[0];
    for (const sc of this.scenes) {
      if (clampedTime >= sc.startSec && clampedTime <= sc.endSec) {
        activeScene = sc;
        break;
      }
    }

    // Calculate scene progress
    const sceneElapsed = clampedTime - activeScene.startSec;
    const sceneProgress = activeScene.durationSec > 0 ? Math.max(0, Math.min(1, sceneElapsed / activeScene.durationSec)) : 1;

    // Map scene progress to route progress
    const routeProgress = activeScene.startProgress + (activeScene.endProgress - activeScene.startProgress) * sceneProgress;

    // Sample route geometry
    const sample = sampleRouteAtProgress(this.trip.points, routeProgress, true);

    // Evaluate camera state
    const camera = CameraDirector.evaluateCamera(
      this.trip,
      routeProgress,
      activeScene,
      sceneProgress,
      this.defaultPitch
    );

    // Determine active place visit (if near a stop)
    let activeVisit: PlaceVisit | null = activeScene.associatedVisit || null;
    if (!activeVisit && this.trip.visits.length > 0) {
      for (const v of this.trip.visits) {
        if (Math.abs(sample.sourceTimestampMs - v.arrivalMs) < 15 * 60 * 1000) {
          activeVisit = v;
          break;
        }
      }
    }

    return {
      videoTimeSec: clampedTime,
      totalDurationSec: this.totalDurationSec,
      progress: routeProgress,
      sourceTimestampMs: sample.sourceTimestampMs,
      coordinate: sample.coordinate,
      rawBearingDeg: sample.rawBearingDeg,
      visualBearingDeg: sample.visualBearingDeg,
      speedKmh: sample.speedKmh,
      cumulativeDistanceM: sample.cumulativeDistanceM,
      totalDistanceM: this.trip.totalDistanceM,
      activeSegmentIndex: 0,
      activeVisit,
      camera,
      activeScene,
      isPlaying: false,
    };
  }
}
