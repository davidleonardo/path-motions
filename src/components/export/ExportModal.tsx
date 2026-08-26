import React, { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { X, Video, Download, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useExportStore } from '../../stores/exportStore';
import { ASPECT_RATIO_DIMENSIONS } from '../../domain/export';
import { VideoExportEngine } from '../../video/VideoExportEngine';
import { probeVideoCapabilities, BrowserVideoCapabilities } from '../../video/capabilityProbe';

interface ExportModalProps {
  map: maplibregl.Map | null;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ map, onClose }) => {
  const { activeTrip, preset, aspectRatio, resolution, getExportConfig, animationMode, cameraMovement } = useProjectStore();
  const {
    isExporting,
    progress,
    result,
    setIsExporting,
    setProgress,
    setResult,
    setAbortController,
    cancelExport,
    reset,
  } = useExportStore();

  const [capabilities, setCapabilities] = useState<BrowserVideoCapabilities | null>(null);

  const config = getExportConfig();
  const dim = ASPECT_RATIO_DIMENSIONS[aspectRatio][resolution];
  const totalFrames = Math.round(config.durationSec * config.fps);

  useEffect(() => {
    probeVideoCapabilities(dim.width, dim.height, config.fps).then(setCapabilities);
    return () => {
      reset();
    };
  }, []);

  const handleStartExport = async () => {
    if (!map || !activeTrip) return;

    reset();
    setIsExporting(true);

    const ac = new AbortController();
    setAbortController(ac);

    try {
      const res = await VideoExportEngine.exportVideo(
        map,
        activeTrip,
        preset,
        config,
        dim.width,
        dim.height,
        (p) => setProgress(p),
        animationMode,
        cameraMovement,
        ac.signal
      );
      setResult(res);
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setAbortController(null);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + ' MB';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="max-w-lg w-full bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 relative overflow-hidden select-none space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Video</h3>
              <p className="text-xs text-slate-400">
                Mode: <span className="font-semibold text-cyan-300 capitalize">{animationMode === 'simple' ? 'Simple (Clean 2D)' : 'Cinematic 3D'}</span> • {cameraMovement}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export specs summary */}
        {!isExporting && !result && (
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Resolution:</span>
                <span className="font-bold text-slate-200 ml-1.5">{dim.width} × {dim.height} ({resolution})</span>
              </div>
              <div>
                <span className="text-slate-400">Framerate:</span>
                <span className="font-bold text-slate-200 ml-1.5">{config.fps} FPS</span>
              </div>
              <div>
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-slate-200 ml-1.5">{config.durationSec}s ({totalFrames} frames)</span>
              </div>
              <div>
                <span className="text-slate-400">Format:</span>
                <span className="font-bold text-cyan-400 ml-1.5">MP4 (H.264 AVC)</span>
              </div>
            </div>

            {capabilities && (
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>WebCodecs Hardware Acceleration Ready</span>
              </div>
            )}
          </div>
        )}

        {/* Exporting Progress State */}
        {isExporting && progress && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                {progress.state === 'preparing' && 'Preparing scene assets...'}
                {progress.state === 'rendering' && `Rendering frame ${progress.currentFrame} / ${progress.totalFrames}`}
                {progress.state === 'muxing' && 'Finalizing MP4 container...'}
              </span>
              <span className="text-cyan-400 font-mono text-sm">{progress.percentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Speed: {progress.fpsActual} FPS</span>
              <span>Est. Remaining: {Math.max(0, Math.round(progress.estimatedRemainingMs / 1000))}s</span>
            </div>
          </div>
        )}

        {/* Completed State */}
        {result && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Video Rendered Successfully!</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {result.filename} ({formatMb(result.sizeBytes)})
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isExporting ? (
            <button
              onClick={cancelExport}
              className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
            >
              Cancel Render
            </button>
          ) : result ? (
            <>
              <button
                onClick={handleStartExport}
                className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Render Again
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download MP4 Video</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleStartExport}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-98"
            >
              <Video className="w-4 h-4" />
              <span>Start MP4 Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
