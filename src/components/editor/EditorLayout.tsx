import React, { useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Header } from '../common/Header';
import { ControlPanel } from './ControlPanel';
import { MapViewport } from '../map/MapViewport';
import { TimelineScrubber } from '../timeline/TimelineScrubber';
import { ExportModal } from '../export/ExportModal';
import { TimelineDropzone } from '../import/TimelineDropzone';
import { useProjectStore } from '../../stores/projectStore';
import { DEMO_TRIPS } from '../../demo/demoTrips';

export const EditorLayout: React.FC = () => {
  const { activeTrip, setTrips } = useProjectStore();
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Default load demo trip on start if no trip loaded
  React.useEffect(() => {
    if (!activeTrip) {
      setTrips(DEMO_TRIPS);
    }
  }, [activeTrip]);

  return (
    <div className="w-screen h-screen flex flex-col bg-background text-slate-100 overflow-hidden font-sans">
      {/* 1. Header */}
      <Header
        onOpenExport={() => setShowExportModal(true)}
        onOpenImport={() => setShowImportModal(true)}
      />

      {/* 2. Main Workspace (Sidebar + Map Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        <ControlPanel />

        <main className="flex-1 h-full relative bg-slate-950 flex flex-col">
          <MapViewport onMapReady={(map) => setMapInstance(map)} />
        </main>
      </div>

      {/* 3. Bottom Timeline Scrubber */}
      <TimelineScrubber />

      {/* 4. Export Modal */}
      {showExportModal && (
        <ExportModal map={mapInstance} onClose={() => setShowExportModal(false)} />
      )}

      {/* 5. Import / Trips Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-2xl w-full bg-surface border border-surface-border rounded-2xl p-6 relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <TimelineDropzone onClose={() => setShowImportModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
