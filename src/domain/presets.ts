export type PresetId =
  | 'dark-neon'
  | 'clean-minimal'
  | 'midnight-drive'
  | 'travel-film'
  | 'fitness-pro';

export type HudPresetId = 'minimal' | 'glass' | 'sport' | 'travel-film' | 'neon' | 'none';

export interface VisualPreset {
  id: PresetId;
  name: string;
  description: string;
  basemapStyle: string;
  routeColor: string;
  routeGlowColor: string;
  routeFutureColor: string;
  routeWidth: number;
  glowRadius: number;
  markerColor: string;
  markerGlow: string;
  hudPreset: HudPresetId;
  defaultPitch: number;
  defaultLookAheadM: number;
  vignette: boolean;
  pulseMarker: boolean;
}

export const VISUAL_PRESETS: Record<PresetId, VisualPreset> = {
  'dark-neon': {
    id: 'dark-neon',
    name: 'Dark Neon',
    description: 'High contrast dark map with vibrant cyan laser trails and glowing markers.',
    basemapStyle: 'https://tiles.openfreemap.org/styles/dark',
    routeColor: '#00f2fe',
    routeGlowColor: 'rgba(0, 242, 254, 0.45)',
    routeFutureColor: 'rgba(255, 255, 255, 0.15)',
    routeWidth: 4.5,
    glowRadius: 18,
    markerColor: '#ffffff',
    markerGlow: '#00f2fe',
    hudPreset: 'neon',
    defaultPitch: 52,
    defaultLookAheadM: 180,
    vignette: true,
    pulseMarker: true,
  },
  'clean-minimal': {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Light, crisp, modern map design perfect for professional travel and blogs.',
    basemapStyle: 'https://tiles.openfreemap.org/styles/positron',
    routeColor: '#0284c7',
    routeGlowColor: 'rgba(2, 132, 199, 0.25)',
    routeFutureColor: 'rgba(0, 0, 0, 0.1)',
    routeWidth: 4,
    glowRadius: 8,
    markerColor: '#0369a1',
    markerGlow: '#38bdf8',
    hudPreset: 'glass',
    defaultPitch: 25,
    defaultLookAheadM: 120,
    vignette: false,
    pulseMarker: false,
  },
  'midnight-drive': {
    id: 'midnight-drive',
    name: 'Midnight Drive',
    description: 'Cinematic amber & gold road lines on sleek midnight asphalt.',
    basemapStyle: 'https://tiles.openfreemap.org/styles/dark',
    routeColor: '#fbbf24',
    routeGlowColor: 'rgba(251, 191, 36, 0.4)',
    routeFutureColor: 'rgba(255, 255, 255, 0.12)',
    routeWidth: 5,
    glowRadius: 14,
    markerColor: '#fffbeb',
    markerGlow: '#f59e0b',
    hudPreset: 'glass',
    defaultPitch: 58,
    defaultLookAheadM: 220,
    vignette: true,
    pulseMarker: true,
  },
  'travel-film': {
    id: 'travel-film',
    name: 'Travel Documentary',
    description: 'Warm, natural colors with emphasized place cards and smooth panoramic camera.',
    basemapStyle: 'https://tiles.openfreemap.org/styles/liberty',
    routeColor: '#ec4899',
    routeGlowColor: 'rgba(236, 72, 153, 0.35)',
    routeFutureColor: 'rgba(15, 23, 42, 0.2)',
    routeWidth: 4.5,
    glowRadius: 12,
    markerColor: '#ffffff',
    markerGlow: '#f43f5e',
    hudPreset: 'travel-film',
    defaultPitch: 42,
    defaultLookAheadM: 150,
    vignette: true,
    pulseMarker: true,
  },
  'fitness-pro': {
    id: 'fitness-pro',
    name: 'Fitness Pro',
    description: 'Electric lime telemetry track with sport-oriented pace and distance HUD.',
    basemapStyle: 'https://tiles.openfreemap.org/styles/bright',
    routeColor: '#10b981',
    routeGlowColor: 'rgba(16, 185, 129, 0.45)',
    routeFutureColor: 'rgba(0, 0, 0, 0.15)',
    routeWidth: 5,
    glowRadius: 12,
    markerColor: '#ffffff',
    markerGlow: '#34d399',
    hudPreset: 'sport',
    defaultPitch: 35,
    defaultLookAheadM: 100,
    vignette: false,
    pulseMarker: true,
  },
};
