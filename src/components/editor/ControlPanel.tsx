import React from 'react';
import { Palette, Clock, Smartphone, Monitor, Square, Sliders, Eye, Sparkles, Compass, Type } from 'lucide-react';
import { useProjectStore, CameraMovement } from '../../stores/projectStore';
import { PresetId, VISUAL_PRESETS } from '../../domain/presets';
import { AspectRatio, ResolutionPreset } from '../../domain/export';

export const ControlPanel: React.FC = () => {
  const {
    animationMode,
    cameraMovement,
    activePresetId,
    durationSec,
    aspectRatio,
    resolution,
    fps,
    showSocialGuides,
    videoTitle,
    setAnimationMode,
    setCameraMovement,
    setPreset,
    setDurationSec,
    setAspectRatio,
    setResolution,
    setFps,
    setShowSocialGuides,
    setVideoTitle,
  } = useProjectStore();

  const presetsList = Object.values(VISUAL_PRESETS);

  return (
    <aside className="w-84 h-full bg-surface/95 border-r border-surface-border p-5 flex flex-col gap-5 overflow-y-auto z-20 select-none">
      {/* 1. ANIMATION STYLE MODE TOGGLE (Ahn-Lab Simple vs Cinematic 3D) */}
      <section className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Animation Style
        </label>

        <div className="grid grid-cols-2 p-1 bg-surface-elevated rounded-xl border border-surface-border">
          <button
            onClick={() => setAnimationMode('simple')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              animationMode === 'simple'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍃 Simple (Clean 2D)</span>
          </button>

          <button
            onClick={() => setAnimationMode('cinematic')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              animationMode === 'cinematic'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎬 Cinematic 3D</span>
          </button>
        </div>
      </section>

      {/* 2. CAMERA MOVEMENT (For Simple Mode) */}
      {animationMode === 'simple' ? (
        <section className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" /> Camera Movement
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'steady', label: 'Steady Follow', desc: 'Calm 2D center' },
              { id: 'fixed', label: 'Fixed Overview', desc: 'Whole route fixed' },
              { id: 'dynamic', label: 'Dynamic 2.5D', desc: 'Subtle angle' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCameraMovement(item.id as CameraMovement)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                  cameraMovement === item.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-surface-elevated/40 border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[9px] text-slate-500 leading-tight mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        /* Cinematic Presets list */
        <section className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" /> 3D Visual Theme
          </label>

          <div className="grid grid-cols-1 gap-2">
            {presetsList.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id as PresetId)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-surface-elevated/40 border-surface-border hover:bg-surface-elevated/80'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.routeColor, boxShadow: `0 0 8px ${p.routeColor}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. VIDEO TITLE */}
      <section className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-cyan-400" /> Video Title
        </label>
        <input
          type="text"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          className="w-full bg-surface-elevated text-xs font-medium text-slate-200 border border-surface-border rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          placeholder="e.g. My Journey"
        />
      </section>

      {/* 4. ASPECT RATIO */}
      <section className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-cyan-400" /> Aspect Ratio
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '16:9', label: '16:9', sub: 'Landscape', icon: Monitor },
            { id: '9:16', label: '9:16', sub: 'Portrait', icon: Smartphone },
            { id: '1:1', label: '1:1', sub: 'Square', icon: Square },
          ].map((item) => {
            const isSelected = aspectRatio === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id as AspectRatio)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-surface-elevated/40 border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[9px] text-slate-500">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. DURATION */}
      <section className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-400" /> Duration
        </label>

        <div className="grid grid-cols-5 gap-1.5">
          {[10, 15, 20, 30, 45].map((sec) => (
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

      {/* 6. RESOLUTION & FPS */}
      <section className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-cyan-400" /> Resolution & FPS
        </label>

        <div className="grid grid-cols-2 gap-2">
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

          <select
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value))}
            className="w-full bg-surface-elevated text-xs font-semibold text-slate-200 border border-surface-border rounded-xl p-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="24">24 FPS (Film)</option>
            <option value="30">30 FPS (Standard)</option>
            <option value="60">60 FPS (Smooth)</option>
          </select>
        </div>
      </section>

      {/* 7. SAFE GUIDES TOGGLE */}
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
