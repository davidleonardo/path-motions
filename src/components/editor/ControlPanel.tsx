import React from 'react';
import { Palette, Clock, Smartphone, Monitor, Square, Sliders, Eye } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { PresetId, VISUAL_PRESETS } from '../../domain/presets';
import { AspectRatio, ResolutionPreset } from '../../domain/export';

export const ControlPanel: React.FC = () => {
  const {
    activePresetId,
    durationSec,
    aspectRatio,
    resolution,
    fps,
    showSocialGuides,
    setPreset,
    setDurationSec,
    setAspectRatio,
    setResolution,
    setFps,
    setShowSocialGuides,
  } = useProjectStore();

  const presetsList = Object.values(VISUAL_PRESETS);

  return (
    <aside className="w-80 h-full bg-surface/95 border-r border-surface-border p-5 flex flex-col gap-6 overflow-y-auto z-20 select-none">
      {/* 1. Cinematic Visual Presets */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" /> Visual Theme Preset
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {presetsList.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPreset(p.id as PresetId)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-surface-elevated/40 border-surface-border hover:bg-surface-elevated/80'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: p.routeColor, boxShadow: `0 0 10px ${p.routeColor}` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{p.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Aspect Ratio */}
      <section className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-cyan-400" /> Format & Ratio
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '16:9', label: '16:9', sub: 'YouTube', icon: Monitor },
            { id: '9:16', label: '9:16', sub: 'Reels/TikTok', icon: Smartphone },
            { id: '1:1', label: '1:1', sub: 'Square', icon: Square },
          ].map((item) => {
            const isSelected = aspectRatio === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id as AspectRatio)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-surface-elevated/40 border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-500">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Duration */}
      <section className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-400" /> Video Duration
        </label>

        <div className="grid grid-cols-4 gap-2">
          {[15, 30, 45, 60].map((sec) => (
            <button
              key={sec}
              onClick={() => setDurationSec(sec)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                durationSec === sec
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                  : 'bg-surface-elevated/40 border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </section>

      {/* 4. Output Resolution & FPS */}
      <section className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-cyan-400" /> Export Quality
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] text-slate-400 mb-1 block">Resolution</span>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as ResolutionPreset)}
              className="w-full bg-surface-elevated text-xs font-semibold text-slate-200 border border-surface-border rounded-xl p-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="1440p">1440p 2K</option>
              <option value="4k">4K Ultra HD</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 mb-1 block">Framerate</span>
            <select
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-full bg-surface-elevated text-xs font-semibold text-slate-200 border border-surface-border rounded-xl p-2 focus:outline-none focus:border-cyan-500"
            >
              <option value={30}>30 FPS (Standard)</option>
              <option value={60}>60 FPS (Cinematic Smooth)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. Safe Area Guide Toggle */}
      {aspectRatio === '9:16' && (
        <section className="pt-2 border-t border-slate-800">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" /> Social Safe Guides
            </span>
            <input
              type="checkbox"
              checked={showSocialGuides}
              onChange={(e) => setShowSocialGuides(e.target.checked)}
              className="rounded accent-cyan-500"
            />
          </label>
        </section>
      )}
    </aside>
  );
};
