import { NormalizedTrip } from '../domain/timeline';
import { segmentPointsIntoTrip } from '../geo/segmentation';

// 1. Jakarta to Bandung Scenic Expressway Road Trip (Indonesia)
function generateJakartaBandungTrip(): NormalizedTrip {
  const waypoints = [
    { name: 'Monas, Central Jakarta', lat: -6.175392, lng: 106.827153 },
    { name: 'Semanggi Interchange', lat: -6.219842, lng: 106.815334 },
    { name: 'Cawang Highway Junction', lat: -6.248384, lng: 106.871029 },
    { name: 'Bekasi Barat Interchange', lat: -6.245842, lng: 106.992842 },
    { name: 'Cikarang Utama Toll Gate', lat: -6.315891, lng: 107.152843 },
    { name: 'Karawang Timur Rest Area', lat: -6.368492, lng: 107.348291 },
    { name: 'Purwakarta Hills & Cipularang', lat: -6.552849, lng: 107.442849 },
    { name: 'Cisomang Scenic Viaduct', lat: -6.685942, lng: 107.412849 },
    { name: 'Padalarang Valley', lat: -6.839482, lng: 107.478291 },
    { name: 'Pasteur Toll Gate', lat: -6.892849, lng: 107.578291 },
    { name: 'Gedung Sate, Bandung', lat: -6.902484, lng: 107.618765 },
  ];

  const points: { lat: number; lng: number; timestampMs: number; accuracyM: number }[] = [];
  const baseTime = Date.parse('2026-08-15T08:00:00Z');
  let currentMs = baseTime;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const w1 = waypoints[i];
    const w2 = waypoints[i + 1];
    const steps = 30; // Intermediates for smooth path
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      // Add subtle curve jitter
      const curveJitterLat = Math.sin(t * Math.PI) * 0.003 * ((i % 2 === 0 ? 1 : -1));
      const curveJitterLng = Math.cos(t * Math.PI) * 0.002 * ((i % 2 === 0 ? -1 : 1));

      points.push({
        lat: w1.lat + (w2.lat - w1.lat) * t + curveJitterLat,
        lng: w1.lng + (w2.lng - w1.lng) * t + curveJitterLng,
        timestampMs: currentMs,
        accuracyM: 8,
      });
      currentMs += 45000; // 45 seconds per sample
    }
  }

  const explicitVisits = [
    {
      id: 'visit-1',
      name: 'Monas (National Monument)',
      address: 'Central Jakarta',
      coordinate: { lat: -6.175392, lng: 106.827153 },
      arrivalMs: baseTime,
      departureMs: baseTime + 15 * 60 * 1000,
      durationMs: 15 * 60 * 1000,
      source: 'timeline' as const,
    },
    {
      id: 'visit-2',
      name: 'Karawang KM 57 Rest Area',
      address: 'Cipularang Toll Road',
      coordinate: { lat: -6.368492, lng: 107.348291 },
      arrivalMs: baseTime + 45 * 60 * 1000,
      departureMs: baseTime + 65 * 60 * 1000,
      durationMs: 20 * 60 * 1000,
      source: 'timeline' as const,
    },
    {
      id: 'visit-3',
      name: 'Gedung Sate Bandung',
      address: 'Bandung, West Java',
      coordinate: { lat: -6.902484, lng: 107.618765 },
      arrivalMs: currentMs,
      departureMs: currentMs + 30 * 60 * 1000,
      durationMs: 30 * 60 * 1000,
      source: 'timeline' as const,
    },
  ];

  return segmentPointsIntoTrip(points, 'Jakarta to Bandung Scenic Road Trip', explicitVisits);
}

// 2. Tokyo Explorer (Japan)
function generateTokyoExplorerTrip(): NormalizedTrip {
  const waypoints = [
    { name: 'Shibuya Scramble Crossing', lat: 35.659495, lng: 139.700554 },
    { name: 'Meiji Jingu Shrine', lat: 35.676398, lng: 139.699326 },
    { name: 'Shinjuku Gyoen National Garden', lat: 35.685176, lng: 139.710052 },
    { name: 'Imperial Palace Tokyo', lat: 35.685175, lng: 139.752799 },
    { name: 'Ginza Shopping District', lat: 35.671989, lng: 139.763965 },
    { name: 'Akihabara Electric Town', lat: 35.698383, lng: 139.773071 },
    { name: 'Senso-ji Temple, Asakusa', lat: 35.714765, lng: 139.796655 },
  ];

  const points: { lat: number; lng: number; timestampMs: number; accuracyM: number }[] = [];
  const baseTime = Date.parse('2026-08-18T10:00:00Z');
  let currentMs = baseTime;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const w1 = waypoints[i];
    const w2 = waypoints[i + 1];
    const steps = 25;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      points.push({
        lat: w1.lat + (w2.lat - w1.lat) * t,
        lng: w1.lng + (w2.lng - w1.lng) * t,
        timestampMs: currentMs,
        accuracyM: 5,
      });
      currentMs += 30000;
    }
  }

  const explicitVisits = [
    {
      id: 'visit-tokyo-1',
      name: 'Shibuya Crossing',
      coordinate: { lat: 35.659495, lng: 139.700554 },
      arrivalMs: baseTime,
      departureMs: baseTime + 20 * 60 * 1000,
      durationMs: 20 * 60 * 1000,
      source: 'timeline' as const,
    },
    {
      id: 'visit-tokyo-2',
      name: 'Imperial Palace',
      coordinate: { lat: 35.685175, lng: 139.752799 },
      arrivalMs: baseTime + 40 * 60 * 1000,
      departureMs: baseTime + 55 * 60 * 1000,
      durationMs: 15 * 60 * 1000,
      source: 'timeline' as const,
    },
    {
      id: 'visit-tokyo-3',
      name: 'Senso-ji Temple Asakusa',
      coordinate: { lat: 35.714765, lng: 139.796655 },
      arrivalMs: currentMs,
      departureMs: currentMs + 30 * 60 * 1000,
      durationMs: 30 * 60 * 1000,
      source: 'timeline' as const,
    },
  ];

  return segmentPointsIntoTrip(points, 'Tokyo Metropolitan Highlights', explicitVisits);
}

export const DEMO_TRIPS: NormalizedTrip[] = [
  generateJakartaBandungTrip(),
  generateTokyoExplorerTrip(),
];
