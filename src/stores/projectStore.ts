import { create } from 'zustand';
import { NormalizedTrip } from '../domain/timeline';
import { AspectRatio, ExportConfig, ResolutionPreset } from '../domain/export';
import { PresetId, VISUAL_PRESETS, VisualPreset } from '../domain/presets';

export type AnimationMode = 'simple' | 'cinematic';
export type CameraMovement = 'fixed' | 'steady' | 'dynamic' | 'cinematic';

interface ProjectState {
  trips: NormalizedTrip[];
  selectedTripId: string | null;
  activeTrip: NormalizedTrip | null;
  animationMode: AnimationMode;
  cameraMovement: CameraMovement;
  activePresetId: PresetId;
  preset: VisualPreset;
  durationSec: number;
  fps: number;
  aspectRatio: AspectRatio;
  resolution: ResolutionPreset;
  showSocialGuides: boolean;
  strictPrivacyMode: boolean;
  videoTitle: string;

  setTrips: (trips: NormalizedTrip[]) => void;
  selectTrip: (id: string) => void;
  setAnimationMode: (mode: AnimationMode) => void;
  setCameraMovement: (movement: CameraMovement) => void;
  setPreset: (presetId: PresetId) => void;
  setDurationSec: (dur: number) => void;
  setFps: (fps: number) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setResolution: (res: ResolutionPreset) => void;
  setShowSocialGuides: (show: boolean) => void;
  setStrictPrivacyMode: (strict: boolean) => void;
  setVideoTitle: (title: string) => void;
  getExportConfig: () => ExportConfig;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  trips: [],
  selectedTripId: null,
  activeTrip: null,
  animationMode: 'simple',
  cameraMovement: 'steady',
  activePresetId: 'clean-minimal',
  preset: VISUAL_PRESETS['clean-minimal'],
  durationSec: 15,
  fps: 30,
  aspectRatio: '16:9',
  resolution: '1080p',
  showSocialGuides: false,
  strictPrivacyMode: false,
  videoTitle: 'My Journey',

  setTrips: (trips) => {
    const firstTrip = trips.length > 0 ? trips[0] : null;
    set({
      trips,
      selectedTripId: firstTrip ? firstTrip.id : null,
      activeTrip: firstTrip,
      videoTitle: firstTrip ? firstTrip.title : 'My Journey',
    });
  },

  selectTrip: (id) => {
    const trip = get().trips.find((t) => t.id === id) || null;
    set({ selectedTripId: id, activeTrip: trip, videoTitle: trip ? trip.title : get().videoTitle });
  },

  setAnimationMode: (animationMode) => {
    if (animationMode === 'simple') {
      set({
        animationMode,
        cameraMovement: 'steady',
        activePresetId: 'clean-minimal',
        preset: VISUAL_PRESETS['clean-minimal'],
      });
    } else {
      set({
        animationMode,
        cameraMovement: 'cinematic',
        activePresetId: 'dark-neon',
        preset: VISUAL_PRESETS['dark-neon'],
      });
    }
  },

  setCameraMovement: (cameraMovement) => set({ cameraMovement }),
  setPreset: (presetId) => {
    const preset = VISUAL_PRESETS[presetId] || VISUAL_PRESETS['clean-minimal'];
    set({ activePresetId: presetId, preset });
  },

  setDurationSec: (durationSec) => set({ durationSec }),
  setFps: (fps) => set({ fps }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setResolution: (resolution) => set({ resolution }),
  setShowSocialGuides: (showSocialGuides) => set({ showSocialGuides }),
  setStrictPrivacyMode: (strictPrivacyMode) => set({ strictPrivacyMode }),
  setVideoTitle: (videoTitle) => set({ videoTitle }),

  getExportConfig: () => {
    const { aspectRatio, resolution, fps, durationSec } = get();
    return {
      aspectRatio,
      resolution,
      fps,
      durationSec,
      bitrateMbps: 16,
      codec: 'avc',
      showHud: true,
      showAttribution: true,
    };
  },
}));
