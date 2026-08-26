import { create } from 'zustand';
import { ExportProgress } from '../domain/export';
import { ExportResult } from '../video/VideoExportEngine';

interface ExportStore {
  isExporting: boolean;
  progress: ExportProgress | null;
  result: ExportResult | null;
  abortController: AbortController | null;

  setIsExporting: (exporting: boolean) => void;
  setProgress: (progress: ExportProgress | null) => void;
  setResult: (result: ExportResult | null) => void;
  setAbortController: (ac: AbortController | null) => void;
  cancelExport: () => void;
  reset: () => void;
}

export const useExportStore = create<ExportStore>((set, get) => ({
  isExporting: false,
  progress: null,
  result: null,
  abortController: null,

  setIsExporting: (isExporting) => set({ isExporting }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  setAbortController: (abortController) => set({ abortController }),

  cancelExport: () => {
    const ac = get().abortController;
    if (ac) {
      ac.abort();
      set({ isExporting: false, abortController: null });
    }
  },

  reset: () => set({ isExporting: false, progress: null, result: null, abortController: null }),
}));
