export interface Coordinate {
  lat: number;
  lng: number;
}

export type TravelMode =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'car'
  | 'train'
  | 'bus'
  | 'motorcycle'
  | 'flight'
  | 'boat'
  | 'unknown';

export interface TimelinePoint {
  id: string;
  coordinate: Coordinate;
  timestampMs: number;
  accuracyM?: number;
  altitudeM?: number;
  sourceIndex: number;
}

export interface RouteSample extends TimelinePoint {
  elapsedMs: number;
  segmentDistanceM: number;
  cumulativeDistanceM: number;
  speedKmh: number;
  rawBearingDeg: number;
  visualBearingDeg: number;
  mode: TravelMode;
}

export interface PlaceVisit {
  id: string;
  name: string;
  address?: string;
  coordinate: Coordinate;
  arrivalMs: number;
  departureMs: number;
  durationMs: number;
  source: 'timeline' | 'detected' | 'manual';
  category?: string;
}

export interface TripSegment {
  id: string;
  startMs: number;
  endMs: number;
  mode: TravelMode;
  points: RouteSample[];
  distanceM: number;
  durationMs: number;
  avgSpeedKmh: number;
}

export interface PrivacyZone {
  id: string;
  name: string;
  coordinate: Coordinate;
  radiusM: number;
  behavior: 'hide' | 'trim' | 'blur-path';
}

export * from './trip';
