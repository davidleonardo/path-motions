import React from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { usePlaybackStore } from '../../stores/playbackStore';

export const TimelineScrubber: React.FC = () => {
  const { durationSec } = useProjectStore();
  const {
    isPlaying,
    currentTimeSec,
    playbackSpeed,
    togglePlay,
    setCurrentTimeSec,
    setPlaybackSpeed,
  } = usePlaybackStore();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTimeSec(val);
  };

  const handleRestart = () => {
    setCurrentTimeSec(0);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = durationSec > 0 ? (currentTimeSec / durationSec) * 100 : 0;

  return (
    <div className="h-16 px-6 bg-surface/95 border-t border-surface-border flex items-center justify-between gap-6 z-20 backdrop-blur-md select-none">
      {/* Play / Pause / Restart */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={handleRestart}
          title="Restart animation"
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-elevated flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scrubber slider and time display */}
      <div className="flex-1 flex items-center gap-4">
        <span className="text-xs font-mono font-bold text-slate-300 w-12 text-right">
          {formatSeconds(currentTimeSec)}
        </span>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={durationSec}
            step={0.05}
            value={currentTimeSec}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          {/* Active progress highlight */}
          <div
            className="absolute left-0 top-[calc(50%-4px)] h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-lg pointer-events-none"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <span className="text-xs font-mono font-medium text-slate-500 w-12">
          {formatSeconds(durationSec)}
        </span>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1.5">
        <FastForward className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="bg-surface-elevated text-xs font-semibold text-slate-200 border border-surface-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value={0.5}>0.5×</option>
          <option value={1.0}>1.0×</option>
          <option value={1.5}>1.5×</option>
          <option value={2.0}>2.0×</option>
        </select>
      </div>
    </div>
  );
};
