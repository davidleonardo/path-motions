export type TimelineFileFormat =
  | 'google-timeline-on-device'
  | 'google-takeout-records'
  | 'geojson'
  | 'generic-coordinates'
  | 'unknown';

/**
 * Inspects JSON structure to determine format adapter.
 */
export function detectTimelineFormat(data: any): TimelineFileFormat {
  if (!data || typeof data !== 'object') return 'unknown';

  // 1. Google Takeout Records.json (contains "locations" array with latitudeE7/longitudeE7)
  if (Array.isArray(data.locations) && data.locations.length > 0) {
    const sample = data.locations[0];
    if ('latitudeE7' in sample || 'latitude' in sample) {
      return 'google-takeout-records';
    }
  }

  // 2. Google Timeline on-device export (contains "timelineObjects" or "semanticSegments" or "rawSignals")
  if (Array.isArray(data.timelineObjects) || Array.isArray(data.semanticSegments) || Array.isArray(data.rawSignals)) {
    return 'google-timeline-on-device';
  }

  // Direct array of timeline objects
  if (Array.isArray(data) && data.length > 0) {
    const sample = data[0];
    if (sample.activitySegment || sample.placeVisit) {
      return 'google-timeline-on-device';
    }
    if ('latitudeE7' in sample || ('lat' in sample && 'lng' in sample)) {
      return 'generic-coordinates';
    }
  }

  // GeoJSON LineString or FeatureCollection
  if (data.type === 'FeatureCollection' || data.type === 'Feature' || data.type === 'LineString') {
    return 'geojson';
  }

  return 'unknown';
}
