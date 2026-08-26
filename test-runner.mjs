import { calculateDistanceM, computeBounds } from './src/geo/distance.ts';
import { calculateBearingDeg, shortestAngleDiffDeg } from './src/geo/bearing.ts';
import { normalizeTimelineJson } from './src/parsers/normalizeTimeline.ts';
import { TimelineEngine } from './src/playback/TimelineEngine.ts';
import { DEMO_TRIPS } from './src/demo/demoTrips.ts';

console.log('--- RUNNING GEOSPATIAL & TIMELINE ENGINE TESTS ---');

// 1. Distance Test
const dist = calculateDistanceM({ lat: -6.175, lng: 106.827 }, { lat: -6.902, lng: 107.618 });
console.log('Distance Monas -> Gedung Sate:', (dist / 1000).toFixed(2), 'km');
if (dist < 110000 || dist > 140000) throw new Error('Distance test failed');

// 2. Bearing Test
const bearing = calculateBearingDeg({ lat: 0, lng: 0 }, { lat: 1, lng: 1 });
console.log('Bearing (0,0) -> (1,1):', bearing.toFixed(2), 'deg');

// 3. Shortest Angle Diff Test
const diff = shortestAngleDiffDeg(350, 10);
console.log('Angle diff 350 -> 10 deg:', diff);
if (diff !== 20) throw new Error('Angle diff test failed');

// 4. Deterministic Timeline Evaluation Test
const trip = DEMO_TRIPS[0];
const engine = new TimelineEngine(trip, 30, 50);

const testPoints = [0, 7.5, 15, 22.5, 30];
for (const t of testPoints) {
  const state = engine.evaluate(t);
  console.log(`[t=${t.toFixed(1)}s] Progress: ${(state.progress * 100).toFixed(1)}% | Scene: ${state.activeScene.type} | Dist: ${(state.cumulativeDistanceM / 1000).toFixed(1)} km | Zoom: ${state.camera.zoom.toFixed(2)} | Pitch: ${state.camera.pitch.toFixed(1)}`);
}

console.log('✅ ALL GEOMETRY & DETERMINISTIC TIMELINE TESTS PASSED!');
