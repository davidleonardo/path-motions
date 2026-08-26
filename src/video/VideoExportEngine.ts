import maplibregl from 'maplibre-gl';
import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH } from 'mediabunny';
import { NormalizedTrip, RouteSample } from '../domain/timeline';
import { VisualPreset } from '../domain/presets';
import { ExportConfig, ExportProgress } from '../domain/export';
import { TimelineEngine } from '../playback/TimelineEngine';
import { CompositeRenderer } from '../rendering/CompositeRenderer';
import { MapFrameBarrier } from '../rendering/MapFrameBarrier';

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  totalFrames: number;
  durationSec: number;
  sizeBytes: number;
}

export class VideoExportEngine {
  public static async exportVideo(
    map: maplibregl.Map,
    trip: NormalizedTrip,
    preset: VisualPreset,
    config: ExportConfig,
    width: number,
    height: number,
    onProgress: (progress: ExportProgress) => void,
    abortSignal?: AbortSignal
  ): Promise<ExportResult> {
    const startTimeMs = performance.now();
    const totalFrames = Math.round(config.durationSec * config.fps);
    const engine = new TimelineEngine(trip, config.durationSec, preset.defaultPitch);
    const compositor = new CompositeRenderer(width, height);
    const compositeCanvas = compositor.getCanvas();

    onProgress({
      currentFrame: 0,
      totalFrames,
      percentage: 0,
      fpsActual: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      state: 'preparing',
    });

    const target = new BufferTarget();
    const format = new Mp4OutputFormat();
    const output = new Output({ target, format });

    const canvasSource = new CanvasSource(compositeCanvas, {
      codec: 'avc',
      quality: QUALITY_HIGH,
    });
    output.addVideoTrack(canvasSource);

    await output.start();

    try {
      const mapCanvas = map.getCanvas();

      for (let i = 0; i < totalFrames; i++) {
        if (abortSignal?.aborted) {
          await output.cancel();
          throw new Error('Export was cancelled by user');
        }

        const t = i / config.fps;
        const state = engine.evaluate(t);

        // Apply camera to MapLibre
        map.jumpTo({
          center: [state.camera.center.lng, state.camera.center.lat],
          zoom: state.camera.zoom,
          pitch: state.camera.pitch,
          bearing: state.camera.bearing,
        });

        // Update animated route reveal on map
        this.updateMapRouteReveal(map, trip, state.progress, preset);

        // Wait for MapLibre to complete frame render
        await MapFrameBarrier.waitForFrame(map);

        // Composite Map + HUD + Effects
        compositor.renderFrame(mapCanvas, state, preset, config.aspectRatio, false);

        // Add frame to Mediabunny video encoder
        await canvasSource.add(t, 1 / config.fps);

        // Calculate progress stats
        const now = performance.now();
        const elapsedMs = now - startTimeMs;
        const fpsActual = (i + 1) / (elapsedMs / 1000);
        const remainingFrames = totalFrames - (i + 1);
        const estimatedRemainingMs = fpsActual > 0 ? (remainingFrames / fpsActual) * 1000 : 0;

        onProgress({
          currentFrame: i + 1,
          totalFrames,
          percentage: Math.round(((i + 1) / totalFrames) * 100),
          fpsActual: Math.round(fpsActual * 10) / 10,
          elapsedMs,
          estimatedRemainingMs,
          state: 'rendering',
        });
      }

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        fpsActual: 0,
        elapsedMs: performance.now() - startTimeMs,
        estimatedRemainingMs: 0,
        state: 'muxing',
      });

      await output.finalize();

      const buffer = target.buffer;
      if (!buffer) {
        throw new Error('Muxer produced empty video buffer');
      }

      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const sanitizedTitle = trip.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 30);
      const filename = `pathmotion_${sanitizedTitle}_${config.resolution}_${config.fps}fps.mp4`;

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        fpsActual: 0,
        elapsedMs: performance.now() - startTimeMs,
        estimatedRemainingMs: 0,
        state: 'completed',
      });

      return {
        blob,
        url,
        filename,
        totalFrames,
        durationSec: config.durationSec,
        sizeBytes: blob.size,
      };
    } catch (err: any) {
      onProgress({
        currentFrame: 0,
        totalFrames,
        percentage: 0,
        fpsActual: 0,
        elapsedMs: performance.now() - startTimeMs,
        estimatedRemainingMs: 0,
        state: 'error',
        errorMessage: err.message || 'Export error occurred',
      });
      throw err;
    }
  }

  private static updateMapRouteReveal(
    map: maplibregl.Map,
    trip: NormalizedTrip,
    progress: number,
    preset: VisualPreset
  ): void {
    const revealedCount = Math.max(2, Math.floor(trip.points.length * progress));
    const revealedCoords = trip.points.slice(0, revealedCount).map((p: RouteSample) => [p.coordinate.lng, p.coordinate.lat]);

    const source = map.getSource('route-revealed') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: { color: preset.routeColor },
        geometry: {
          type: 'LineString',
          coordinates: revealedCoords,
        },
      });
    }

    // Update moving marker position
    const currPoint = trip.points[Math.min(trip.points.length - 1, revealedCount - 1)];
    if (currPoint) {
      const markerSource = map.getSource('route-marker') as maplibregl.GeoJSONSource;
      if (markerSource) {
        markerSource.setData({
          type: 'Feature',
          properties: {
            bearing: currPoint.visualBearingDeg,
            color: preset.markerColor,
          },
          geometry: {
            type: 'Point',
            coordinates: [currPoint.coordinate.lng, currPoint.coordinate.lat],
          },
        });
      }
    }
  }
}
