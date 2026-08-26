import { create } from 'zustand';
import { NormalizedTrip } from '../domain/timeline';
import { AspectRatio, ExportConfig, ResolutionPreset } from '../domain/export';
import { PresetId, VISUAL_PRESETS, VisualPreset } from '../domain/presets';

interface ProjectState {
  trips: NormalizedTrip[];
  selectedTripId: string | null;
  activeTrip: NormalizedTrip | null;
  activePresetId: PresetId;
  preset: VisualPreset;
  durationSec: number;
  fps: number;
  aspectRatio: AspectRatio;
  resolution: ResolutionPreset;
  showSocialGuides: boolean;
  strictPrivacyMode: boolean;

  setTrips: (trips: NormalizedTrip[]) => void;
  selectTrip: (id: string) => void;
  setPreset: (presetId: PresetId) => void;
  setDurationSec: (dur: number) => void;
  setFps: (fps: number) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setResolution: (res: ResolutionPreset) => void;
  setShowSocialGuides: (show: boolean) => void;
  setStrictPrivacyMode: (strict: boolean) => void;
  getExportConfig: () => ExportConfig;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  trips: [],
  selectedTripId: null,
  activeTrip: null,
  activePresetId: 'dark-neon',
  preset: VISUAL_PRESETS['dark-neon'],
  durationSec: 30,
  fps: 30,
  aspectRatio: '16:9',
  resolution: '1080p',
  showSocialGuides: false,
  strictPrivacyMode: false,

  setTrips: (trips) => {
    const firstTrip = trips.length > 0 ? trips[0] : null;
    set({
      trips,
      selectedTripId: firstTrip ? firstTrip.id : null,
      activeTrip: firstTrip,
    });
  },

  selectTrip: (id) => {
    const trip = get().trips.find((t) => t.id === id) || null;
    set({ selectedTripId: id, activeTrip: trip });
  },

  setPreset: (presetId) => {
    const preset = VISUAL_PRESETS[presetId] || VISUAL_PRESETS['dark-neon'];
    set({ activePresetId: presetId, preset });
  },

  setDurationSec: (durationSec) => set({ durationSec }),
  setFps: (fps) => set({ fps }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setResolution: (resolution) => set({ resolution }),
  setShowSocialGuides: (showSocialGuides) => set({ showSocialGuides }),
  setStrictPrivacyMode: (strictPrivacyMode) => set({ strictPrivacyMode }),

  getExportConfig: () => {
    const { aspectRatio, resolution, fps, durationSec } = get();
    return {
      aspectRatio,
      resolution,
      fps,
      durationSec,
      bitrateMbps: 16,
      codec: 'avc1.640028',
      showHud: true,
      showAttribution: true,
    };
  },
}));
