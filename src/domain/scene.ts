import { CameraProfile, CameraState } from './camera';
import { Coordinate, PlaceVisit } from './timeline';

export type SceneType =
  | 'intro-overview'
  | 'departure'
  | 'follow'
  | 'chase'
  | 'top-down'
  | 'orbit-stop'
  | 'wide-context'
  | 'destination-arrival'
  | 'outro-summary';

export type TransitionType = 'fade' | 'smooth' | 'cut' | 'zoom-in' | 'zoom-out';

export interface Scene {
  id: string;
  type: SceneType;
  title?: string;
  subtitle?: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  startProgress: number;
  endProgress: number;
  cameraProfile: CameraProfile;
  associatedVisit?: PlaceVisit;
  transitionIn: TransitionType;
  transitionOut: TransitionType;
}

export interface PlaybackState {
  videoTimeSec: number;
  totalDurationSec: number;
  progress: number; // 0..1
  sourceTimestampMs: number;
  coordinate: Coordinate;
  rawBearingDeg: number;
  visualBearingDeg: number;
  speedKmh: number;
  cumulativeDistanceM: number;
  totalDistanceM: number;
  activeSegmentIndex: number;
  activeVisit: PlaceVisit | null;
  camera: CameraState;
  activeScene: Scene;
  isPlaying: boolean;
}
