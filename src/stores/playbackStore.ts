import { create } from 'zustand';
import { PlaybackState } from '../domain/scene';

interface PlaybackStore {
  isPlaying: boolean;
  currentTimeSec: number;
  playbackSpeed: number;
  currentState: PlaybackState | null;

  setIsPlaying: (playing: boolean) => void;
  setCurrentTimeSec: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentState: (state: PlaybackState) => void;
  togglePlay: () => void;
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  isPlaying: false,
  currentTimeSec: 0,
  playbackSpeed: 1.0,
  currentState: null,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTimeSec: (currentTimeSec) => set({ currentTimeSec }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setCurrentState: (currentState) => set({ currentState }),
  togglePlay: () => set({ isPlaying: !get().isPlaying }),
}));
