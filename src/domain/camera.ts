import { Coordinate } from './timeline';

export type CameraMode = 'auto' | 'follow' | 'chase' | 'top-down' | 'manual';

export interface CameraState {
  center: Coordinate;
  zoom: number;
  pitch: number;
  bearing: number;
}

export type EasingType =
  | 'linear'
  | 'easeInOutQuad'
  | 'easeInOutCubic'
  | 'easeOutCubic'
  | 'easeInOutQuint';

export interface CameraKeyframe {
  id: string;
  timeSec: number;
  center?: Coordinate;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  easing?: EasingType;
}

export interface CameraProfile {
  pitch: number;
  zoomOffset: number;
  lookAheadM: number;
  rotationSpeedCapDegPerSec: number;
  smoothBearing: boolean;
}
