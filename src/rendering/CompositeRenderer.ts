import { PlaybackState } from '../domain/scene';
import { VisualPreset } from '../domain/presets';
import { AspectRatio } from '../domain/export';
import { HudCanvasRenderer } from './HudCanvasRenderer';

export class CompositeRenderer {
  private compositeCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hudCanvas: HTMLCanvasElement;
  private hudCtx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = width;
    this.compositeCanvas.height = height;
    this.ctx = this.compositeCanvas.getContext('2d', { alpha: false, desynchronized: true })!;

    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = width;
    this.hudCanvas.height = height;
    this.hudCtx = this.hudCanvas.getContext('2d', { alpha: true })!;
  }

  public resize(width: number, height: number): void {
    if (this.compositeCanvas.width !== width || this.compositeCanvas.height !== height) {
      this.compositeCanvas.width = width;
      this.compositeCanvas.height = height;
      this.hudCanvas.width = width;
      this.hudCanvas.height = height;
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.compositeCanvas;
  }

  /**
   * Composites MapLibre WebGL canvas + HUD 2D Canvas into the single final output canvas.
   */
  public renderFrame(
    mapCanvas: HTMLCanvasElement,
    state: PlaybackState,
    preset: VisualPreset,
    aspectRatio: AspectRatio = '16:9',
    showSocialGuides: boolean = false
  ): HTMLCanvasElement {
    const width = this.compositeCanvas.width;
    const height = this.compositeCanvas.height;

    // 1. Draw Map Canvas
    this.ctx.drawImage(mapCanvas, 0, 0, width, height);

    // 2. Draw Vignette effect if enabled
    if (preset.vignette) {
      const grad = this.ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.hypot(width, height) * 0.6
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, width, height);
    }

    // 3. Render HUD onto HUD canvas & composite
    HudCanvasRenderer.render(
      this.hudCtx,
      width,
      height,
      state,
      preset,
      aspectRatio,
      showSocialGuides
    );
    this.ctx.drawImage(this.hudCanvas, 0, 0, width, height);

    return this.compositeCanvas;
  }
}
