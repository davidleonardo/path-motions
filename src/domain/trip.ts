import { Coordinate, RouteSample, TripSegment, PlaceVisit, PrivacyZone } from './timeline';

export interface NormalizedTrip {
  id: string;
  title: string;
  subtitle?: string;
  timezone: string;
  startMs: number;
  endMs: number;
  totalDurationMs: number;
  totalDistanceM: number;
  points: RouteSample[];
  segments: TripSegment[];
  visits: PlaceVisit[];
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  center: Coordinate;
  rawPointCount: number;
}

export interface TripFilterOptions {
  maxAccuracyM: number;
  minDwellMinutes: number;
  stopRadiusM: number;
  smoothing: 'off' | 'low' | 'balanced' | 'cinematic';
  privacyZones: PrivacyZone[];
}
