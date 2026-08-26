import React from 'react';
import { Film, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport, onOpenImport }) => {
  const { activeTrip, strictPrivacyMode, setStrictPrivacyMode } = useProjectStore();

  return (
    <header className="h-16 px-6 bg-surface/90 border-b border-surface-border flex items-center justify-between z-30 select-none backdrop-blur-md">
      {/* Brand logo & status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                PathMotion
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.0 FOSS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Timeline Route-to-Video Visualizer</p>
          </div>
        </div>

        {activeTrip && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/70 border border-surface-border">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200 truncate max-w-xs">{activeTrip.title}</span>
            <span className="text-xs text-slate-400">• {(activeTrip.totalDistanceM / 1000).toFixed(1)} km</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Privacy toggle badge */}
        <button
          onClick={() => setStrictPrivacyMode(!strictPrivacyMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            strictPrivacyMode
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-surface-elevated text-slate-400 hover:text-slate-200 border border-surface-border'
          }`}
          title="100% Local Browser Processing"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Privacy First (Local)</span>
        </button>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-surface-border transition-colors"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Import / Trips</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
        >
          <Video className="w-4 h-4" />
          <span>Export MP4 Video</span>
        </button>
      </div>
    </header>
  );
};
