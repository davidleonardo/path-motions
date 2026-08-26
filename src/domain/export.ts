export type AspectRatio = '16:9' | '9:16' | '1:1';

export type ResolutionPreset = '720p' | '1080p' | '1440p' | '4k';

export interface ExportDimension {
  width: number;
  height: number;
}

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, Record<ResolutionPreset, ExportDimension>> = {
  '16:9': {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '1440p': { width: 2560, height: 1440 },
    '4k': { width: 3840, height: 2160 },
  },
  '9:16': {
    '720p': { width: 720, height: 1280 },
    '1080p': { width: 1080, height: 1920 },
    '1440p': { width: 1440, height: 2560 },
    '4k': { width: 2160, height: 3840 },
  },
  '1:1': {
    '720p': { width: 720, height: 720 },
    '1080p': { width: 1080, height: 1080 },
    '1440p': { width: 1440, height: 1440 },
    '4k': { width: 2160, height: 2160 },
  },
};

export type VideoCodecPreference = 'h264' | 'vp9' | 'vp8' | 'av1' | 'webm-fallback';

export interface ExportConfig {
  aspectRatio: AspectRatio;
  resolution: ResolutionPreset;
  fps: number;
  durationSec: number;
  bitrateMbps: number;
  codec: string;
  showHud: boolean;
  showAttribution: boolean;
}

export interface ExportProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  fpsActual: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  state: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'muxing' | 'completed' | 'canceled' | 'error';
  errorMessage?: string;
}
