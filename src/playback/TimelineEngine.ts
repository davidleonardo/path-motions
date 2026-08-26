import { NormalizedTrip, PlaceVisit } from '../domain/timeline';
import { PlaybackState, Scene } from '../domain/scene';
import { sampleRouteAtProgress } from '../geo/interpolation';
import { CameraDirector } from './CameraDirector';
import { SceneDirector } from './SceneDirector';
import { AnimationMode, CameraMovement } from '../stores/projectStore';

export class TimelineEngine {
  private trip: NormalizedTrip;
  private totalDurationSec: number;
  private scenes: Scene[];
  private defaultPitch: number;
  private animationMode: AnimationMode;
  private cameraMovement: CameraMovement;
  private zoomOffset: number;

  constructor(
    trip: NormalizedTrip,
    totalDurationSec: number = 15,
    defaultPitch: number = 0,
    animationMode: AnimationMode = 'simple',
    cameraMovement: CameraMovement = 'steady',
    zoomOffset: number = 0.4
  ) {
    this.trip = trip;
    this.totalDurationSec = Math.max(5, totalDurationSec);
    this.defaultPitch = defaultPitch;
    this.animationMode = animationMode;
    this.cameraMovement = cameraMovement;
    this.zoomOffset = zoomOffset;
    this.scenes = SceneDirector.generateScenes(trip, this.totalDurationSec);
  }

  public getScenes(): Scene[] {
    return this.scenes;
  }

  public getTotalDurationSec(): number {
    return this.totalDurationSec;
  }

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

    // Map time linearly in simple mode or via scene progress in cinematic mode
    const routeProgress =
      this.animationMode === 'simple'
        ? clampedTime / this.totalDurationSec
        : activeScene.startProgress + (activeScene.endProgress - activeScene.startProgress) * sceneProgress;

    // Sample route geometry
    const sample = sampleRouteAtProgress(this.trip.points, routeProgress, true);

    // Evaluate camera state with +20% closer zoom offset
    const camera = CameraDirector.evaluateCamera(
      this.trip,
      routeProgress,
      activeScene,
      sceneProgress,
      this.defaultPitch,
      this.animationMode,
      this.cameraMovement,
      this.zoomOffset
    );

    // Determine active place visit
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
