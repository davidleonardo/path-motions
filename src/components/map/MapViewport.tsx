import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useProjectStore } from '../../stores/projectStore';
import { usePlaybackStore } from '../../stores/playbackStore';
import { TimelineEngine } from '../../playback/TimelineEngine';
import { HudCanvasRenderer } from '../../rendering/HudCanvasRenderer';
import { RouteSample } from '../../domain/timeline';

interface MapViewportProps {
  onMapReady?: (map: maplibregl.Map) => void;
}

export const MapViewport: React.FC<MapViewportProps> = ({ onMapReady }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);

  const { activeTrip, preset, durationSec, aspectRatio, showSocialGuides, animationMode, cameraMovement, zoomLevel } = useProjectStore();
  const { isPlaying, currentTimeSec, playbackSpeed, setCurrentTimeSec, setCurrentState, setIsPlaying } = usePlaybackStore();

  const [engine, setEngine] = useState<TimelineEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeMsRef = useRef<number>(performance.now());

  // Initialize TimelineEngine
  useEffect(() => {
    if (activeTrip) {
      const eng = new TimelineEngine(
        activeTrip,
        durationSec,
        animationMode === 'simple' ? 0 : preset.defaultPitch,
        animationMode,
        cameraMovement,
        zoomLevel
      );
      setEngine(eng);
    }
  }, [activeTrip, durationSec, preset, animationMode, cameraMovement, zoomLevel]);

  // Initialize MapLibre map instance with high-performance tile caching
  useEffect(() => {
    if (!mapContainerRef.current || !activeTrip) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapOptions: any = {
      container: mapContainerRef.current,
      style: preset.basemapStyle,
      center: [activeTrip.center.lng, activeTrip.center.lat],
      zoom: 12.5 + zoomLevel,
      pitch: animationMode === 'simple' ? 0 : preset.defaultPitch,
      bearing: 0,
      preserveDrawingBuffer: true,
      attributionControl: false,
      renderWorldCopies: false,
      fadeDuration: 0, // Eliminates tile fade-in delay for instant smooth rendering
      maxTileCacheSize: 500, // Keep loaded tiles in memory
    };

    const map = new maplibregl.Map(mapOptions);

    map.on('load', () => {
      mapRef.current = map;
      if (onMapReady) onMapReady(map);

      // Preload & warm cache for entire route bounds
      try {
        map.fitBounds(
          [
            [activeTrip.bounds[0], activeTrip.bounds[1]],
            [activeTrip.bounds[2], activeTrip.bounds[3]],
          ],
          { padding: 40, duration: 0 }
        );
      } catch (e) {
        // Ignore fitBounds fallback
      }

      // Add full future route layer (faint)
      const fullCoords = activeTrip.points.map((p: RouteSample) => [p.coordinate.lng, p.coordinate.lat]);
      map.addSource('route-full', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: fullCoords },
        },
      });

      map.addLayer({
        id: 'route-future',
        type: 'line',
        source: 'route-full',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': preset.routeFutureColor,
          'line-width': preset.routeWidth * 0.75,
        },
      });

      // Add animated revealed route source & layer
      map.addSource('route-revealed', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: fullCoords.slice(0, 2) },
        },
      });

      // Outer glow layer (only in cinematic mode)
      if (animationMode === 'cinematic') {
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route-revealed',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': preset.routeColor,
            'line-width': preset.routeWidth * 3.5,
            'line-opacity': 0.35,
            'line-blur': 4,
          },
        });
      }

      // Main route line
      map.addLayer({
        id: 'route-main',
        type: 'line',
        source: 'route-revealed',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': preset.routeColor,
          'line-width': preset.routeWidth,
        },
      });

      // Moving Marker source & layer
      const startCoord = activeTrip.points[0]?.coordinate || activeTrip.center;
      map.addSource('route-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { color: preset.markerColor },
          geometry: { type: 'Point', coordinates: [startCoord.lng, startCoord.lat] },
        },
      });

      map.addLayer({
        id: 'route-marker-glow',
        type: 'circle',
        source: 'route-marker',
        paint: {
          'circle-radius': 12,
          'circle-color': preset.routeColor,
          'circle-opacity': 0.4,
          'circle-blur': 0.8,
        },
      });

      map.addLayer({
        id: 'route-marker-core',
        type: 'circle',
        source: 'route-marker',
        paint: {
          'circle-radius': 6,
          'circle-color': preset.markerColor,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': preset.routeColor,
        },
      });

      // Jump to initial camera position
      if (engine) {
        const initialState = engine.evaluate(0);
        map.jumpTo({
          center: [initialState.camera.center.lng, initialState.camera.center.lat],
          zoom: initialState.camera.zoom,
          pitch: initialState.camera.pitch,
          bearing: initialState.camera.bearing,
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [activeTrip, preset.basemapStyle, animationMode]);

  // Smooth requestAnimationFrame Playback render loop
  useEffect(() => {
    if (!engine || !activeTrip) return;

    let timeSec = currentTimeSec;

    const renderLoop = () => {
      const now = performance.now();
      const dtSec = (now - lastTimeMsRef.current) / 1000;
      lastTimeMsRef.current = now;

      if (isPlaying) {
        timeSec += dtSec * playbackSpeed;
        if (timeSec >= durationSec) {
          timeSec = durationSec;
          setIsPlaying(false);
        }
        setCurrentTimeSec(timeSec);
      }

      // Evaluate deterministic state
      const state = engine.evaluate(timeSec);
      setCurrentState(state);

      // Update MapLibre camera smoothly
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        const map = mapRef.current;

        map.jumpTo({
          center: [state.camera.center.lng, state.camera.center.lat],
          zoom: state.camera.zoom,
          pitch: state.camera.pitch,
          bearing: state.camera.bearing,
        });

        // Update revealed route line
        const count = Math.max(2, Math.floor(activeTrip.points.length * state.progress));
        const revealedCoords = activeTrip.points.slice(0, count).map((p: RouteSample) => [p.coordinate.lng, p.coordinate.lat]);

        const routeSrc = map.getSource('route-revealed') as maplibregl.GeoJSONSource;
        if (routeSrc) {
          routeSrc.setData({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: revealedCoords },
          });
        }

        const markerSrc = map.getSource('route-marker') as maplibregl.GeoJSONSource;
        if (markerSrc) {
          markerSrc.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [state.coordinate.lng, state.coordinate.lat],
            },
          });
        }
      }

      // Render HUD onto Overlay Canvas
      if (hudCanvasRef.current) {
        const ctx = hudCanvasRef.current.getContext('2d');
        if (ctx) {
          HudCanvasRenderer.render(
            ctx,
            hudCanvasRef.current.width,
            hudCanvasRef.current.height,
            state,
            preset,
            aspectRatio,
            showSocialGuides
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    lastTimeMsRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [engine, isPlaying, playbackSpeed, durationSec, preset, aspectRatio, showSocialGuides]);

  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[82vh]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[82vh]'
      : 'aspect-[16/9] w-full max-h-[82vh]';

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
      <div
        className={`relative overflow-hidden rounded-2xl shadow-2xl border border-surface-border bg-black transition-all ${aspectClass}`}
      >
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        <canvas
          ref={hudCanvasRef}
          width={1920}
          height={aspectRatio === '9:16' ? 3413 : aspectRatio === '1:1' ? 1920 : 1080}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      </div>
    </div>
  );
};
