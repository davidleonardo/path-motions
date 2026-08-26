import React, { useState, useRef } from 'react';
import { UploadCloud, FileJson, Sparkles, CheckCircle2, AlertCircle, Compass, Calendar, Route } from 'lucide-react';
import { normalizeTimelineJson } from '../../parsers/normalizeTimeline';
import { DEMO_TRIPS } from '../../demo/demoTrips';
import { useProjectStore } from '../../stores/projectStore';
import { NormalizedTrip } from '../../domain/timeline';

interface TimelineDropzoneProps {
  onClose?: () => void;
}

export const TimelineDropzone: React.FC<TimelineDropzoneProps> = ({ onClose }) => {
  const { setTrips, selectTrip, activeTrip, trips } = useProjectStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedTrips, setParsedTrips] = useState<NormalizedTrip[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const result = normalizeTimelineJson(jsonData, file.name);

      if (result.trips.length === 0) {
        throw new Error('Could not find any trips or routes in this file.');
      }

      setTrips(result.trips);
      setParsedTrips(result.trips);
      selectTrip(result.trips[0].id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse JSON file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectTrip = (tripId: string) => {
    selectTrip(tripId);
    if (onClose) onClose();
  };

  const handleSelectDemo = (tripIndex: number) => {
    setTrips(DEMO_TRIPS);
    setParsedTrips(DEMO_TRIPS);
    selectTrip(DEMO_TRIPS[tripIndex].id);
    if (onClose) onClose();
  };

  const activeTripList = parsedTrips || (trips.length > 2 ? trips : null);

  return (
    <div className="max-w-2xl w-full mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Import Google Timeline or Location Records
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Supports on-device Google Timeline JSON (with semanticSegments, timelinePath, or visits) and legacy Takeout Records.
        </p>
      </div>

      {/* Drop area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-700 bg-surface-elevated/40 hover:bg-surface-elevated/70 hover:border-slate-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-200 mb-1">
          {isProcessing ? 'Processing local timeline...' : 'Click to browse or drop Timeline.json / Records.json here'}
        </h3>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
          <FileJson className="w-3.5 h-3.5 text-slate-400" />
          <span>Auto-detects semanticSegments, timelinePath, visits, and decimal coordinates</span>
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Discovered Trips from User Upload */}
      {activeTripList && activeTripList.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Route className="w-4 h-4" /> Detected Journeys in File ({activeTripList.length})
            </span>
            <span className="text-xs text-slate-500">Select any trip to visualize</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {activeTripList.slice(0, 20).map((trip) => (
              <button
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  activeTrip?.id === trip.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-surface-elevated/40 border-surface-border text-slate-200 hover:bg-surface-elevated'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{trip.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {(trip.totalDistanceM / 1000).toFixed(1)} km • {trip.points.length} GPS points
                    </div>
                  </div>
                </div>

                {activeTrip?.id === trip.id ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />
                ) : (
                  <span className="text-xs font-semibold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0 ml-2">
                    Open
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Demo Trips Section */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Or Try Built-In Cinematic Demos
          </span>
          <span className="text-xs text-slate-500">Instant Preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEMO_TRIPS.map((demo, idx) => (
            <button
              key={demo.id}
              onClick={() => handleSelectDemo(idx)}
              className="flex flex-col p-4 rounded-xl bg-surface-elevated/60 hover:bg-surface-elevated border border-surface-border hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                  {demo.title}
                </span>
                {activeTrip?.id === demo.id && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs text-slate-400">
                {(demo.totalDistanceM / 1000).toFixed(1)} km • {demo.visits.length} landmark stops
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
