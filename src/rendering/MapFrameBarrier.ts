import maplibregl from 'maplibre-gl';

/**
 * Ensures MapLibre has completed rendering and frame buffers are ready to be captured.
 */
export class MapFrameBarrier {
  public static async waitForFrame(map: maplibregl.Map): Promise<void> {
    return new Promise((resolve) => {
      // Trigger a render frame and resolve when complete
      map.once('render', () => {
        requestAnimationFrame(() => resolve());
      });
      map.triggerRepaint();
    });
  }
}
