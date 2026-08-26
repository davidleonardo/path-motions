import { PlaybackState } from '../domain/scene';
import { VisualPreset } from '../domain/presets';
import { AspectRatio } from '../domain/export';

export class HudCanvasRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: PlaybackState,
    preset: VisualPreset,
    aspectRatio: AspectRatio = '16:9',
    showSocialGuides: boolean = false
  ): void {
    ctx.clearRect(0, 0, width, height);

    const scale = width / 1920; // Scale fonts based on 1080p baseline
    ctx.save();

    // 1. Social Safe Area Guides (only for preview when enabled)
    if (showSocialGuides && aspectRatio === '9:16') {
      this.drawSafeGuides(ctx, width, height);
    }

    // 2. Intro Title Card
    if (state.activeScene.type === 'intro-overview') {
      this.drawIntroCard(ctx, width, height, state, scale);
      ctx.restore();
      return;
    }

    // 3. Outro Summary Card
    if (state.activeScene.type === 'outro-summary') {
      this.drawOutroCard(ctx, width, height, state, scale);
      ctx.restore();
      return;
    }

    // 4. In-Flight HUD Elements
    if (preset.hudPreset !== 'none') {
      this.drawTopBar(ctx, state, preset, scale, aspectRatio);
      this.drawBottomStats(ctx, width, height, state, preset, scale, aspectRatio);
      this.drawProgressBar(ctx, width, height, state, preset, scale);
    }

    // 5. Place Visit Banner (if arriving at a stop)
    if (state.activeVisit) {
      this.drawPlaceCard(ctx, width, height, state, preset, scale);
    }

    ctx.restore();
  }

  private static drawTopBar(
    ctx: CanvasRenderingContext2D,
    state: PlaybackState,
    preset: VisualPreset,
    scale: number,
    aspectRatio: AspectRatio
  ): void {
    const isMobile = aspectRatio === '9:16';
    const topMargin = isMobile ? 120 * scale : 40 * scale;
    const sideMargin = isMobile ? 40 * scale : 50 * scale;

    const dateStr = state.sourceTimestampMs > 0
      ? new Date(state.sourceTimestampMs).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const timeStr = state.sourceTimestampMs > 0
      ? new Date(state.sourceTimestampMs).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      : '';

    // Glass pill background
    const pillWidth = 320 * scale;
    const pillHeight = 54 * scale;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = preset.id === 'dark-neon' ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5 * scale;

    this.roundRect(ctx, sideMargin, topMargin, pillWidth, pillHeight, 27 * scale);
    ctx.fill();
    ctx.stroke();

    // Clock text
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${20 * scale}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🕒 ${timeStr}`, sideMargin + 20 * scale, topMargin + pillHeight / 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${16 * scale}px "Inter", sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, sideMargin + pillWidth - 20 * scale, topMargin + pillHeight / 2);
  }

  private static drawBottomStats(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: PlaybackState,
    preset: VisualPreset,
    scale: number,
    aspectRatio: AspectRatio
  ): void {
    const isMobile = aspectRatio === '9:16';
    const bottomMargin = isMobile ? 180 * scale : 60 * scale;
    const sideMargin = isMobile ? 40 * scale : 50 * scale;

    const panelWidth = isMobile ? width - sideMargin * 2 : 440 * scale;
    const panelHeight = 100 * scale;
    const panelY = height - bottomMargin - panelHeight;

    // Glass background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = preset.id === 'dark-neon' ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5 * scale;

    this.roundRect(ctx, sideMargin, panelY, panelWidth, panelHeight, 20 * scale);
    ctx.fill();
    ctx.stroke();

    const distanceKm = (state.cumulativeDistanceM / 1000).toFixed(1);
    const speed = Math.round(state.speedKmh);

    // Distance metric
    ctx.fillStyle = '#94a3b8';
    ctx.font = `600 ${14 * scale}px "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('DISTANCE', sideMargin + 25 * scale, panelY + 32 * scale);

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${36 * scale}px "JetBrains Mono", monospace`;
    ctx.fillText(distanceKm, sideMargin + 25 * scale, panelY + 70 * scale);

    ctx.fillStyle = preset.routeColor;
    ctx.font = `700 ${16 * scale}px "Inter", sans-serif`;
    const distWidth = ctx.measureText(distanceKm).width;
    ctx.fillText(' KM', sideMargin + 25 * scale + distWidth, panelY + 70 * scale);

    // Speed metric
    const speedX = sideMargin + panelWidth * 0.55;
    ctx.fillStyle = '#94a3b8';
    ctx.font = `600 ${14 * scale}px "Inter", sans-serif`;
    ctx.fillText('SPEED', speedX, panelY + 32 * scale);

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${36 * scale}px "JetBrains Mono", monospace`;
    ctx.fillText(`${speed}`, speedX, panelY + 70 * scale);

    ctx.fillStyle = preset.routeColor;
    ctx.font = `700 ${16 * scale}px "Inter", sans-serif`;
    const speedWidth = ctx.measureText(`${speed}`).width;
    ctx.fillText(' KM/H', speedX + speedWidth, panelY + 70 * scale);
  }

  private static drawProgressBar(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: PlaybackState,
    preset: VisualPreset,
    scale: number
  ): void {
    const barHeight = 6 * scale;
    const y = height - barHeight;

    // Track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, y, width, barHeight);

    // Fill
    const fillWidth = Math.max(0, Math.min(width, width * state.progress));
    ctx.fillStyle = preset.routeColor;
    ctx.fillRect(0, y, fillWidth, barHeight);
  }

  private static drawPlaceCard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: PlaybackState,
    preset: VisualPreset,
    scale: number
  ): void {
    const visit = state.activeVisit!;
    const cardWidth = 420 * scale;
    const cardHeight = 90 * scale;
    const x = width / 2 - cardWidth / 2;
    const y = height * 0.22;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = preset.routeColor;
    ctx.lineWidth = 2 * scale;

    this.roundRect(ctx, x, y, cardWidth, cardHeight, 16 * scale);
    ctx.fill();
    ctx.stroke();

    // Pin icon
    ctx.fillStyle = preset.routeColor;
    ctx.font = `700 ${22 * scale}px "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('📍', x + 20 * scale, y + 42 * scale);

    // Place name
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${20 * scale}px "Inter", sans-serif`;
    ctx.fillText(visit.name.slice(0, 24), x + 55 * scale, y + 40 * scale);

    // Dwell info
    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${14 * scale}px "Inter", sans-serif`;
    ctx.fillText(`Stop Duration • ${Math.round(visit.durationMs / 60000)} min`, x + 55 * scale, y + 68 * scale);
  }

  private static drawIntroCard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: PlaybackState,
    scale: number
  ): void {
    // Subtle backdrop vignette
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.6);
    grad.addColorStop(0, 'rgba(9, 13, 22, 0.2)');
    grad.addColorStop(1, 'rgba(9, 13, 22, 0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${56 * scale}px "Syne", sans-serif`;
    ctx.fillText(state.activeScene.title || 'PathMotion', width / 2, height / 2 - 20 * scale);

    ctx.fillStyle = '#38bdf8';
    ctx.font = `600 ${24 * scale}px "Inter", sans-serif`;
    ctx.fillText(state.activeScene.subtitle || 'Journey Route', width / 2, height / 2 + 35 * scale);
  }

  private static drawOutroCard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: PlaybackState,
    scale: number
  ): void {
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.6);
    grad.addColorStop(0, 'rgba(9, 13, 22, 0.4)');
    grad.addColorStop(1, 'rgba(9, 13, 22, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${54 * scale}px "Syne", sans-serif`;
    ctx.fillText(state.activeScene.title || 'Journey Complete', width / 2, height / 2 - 40 * scale);

    ctx.fillStyle = '#22d3ee';
    ctx.font = `700 ${32 * scale}px "JetBrains Mono", monospace`;
    ctx.fillText(`${(state.totalDistanceM / 1000).toFixed(1)} KM TOTAL`, width / 2, height / 2 + 15 * scale);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${20 * scale}px "Inter", sans-serif`;
    ctx.fillText(state.activeScene.subtitle || 'Rendered with PathMotion', width / 2, height / 2 + 65 * scale);
  }

  private static drawSafeGuides(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    // 9:16 safe margin (15% top, 20% bottom, 5% sides)
    const marginX = width * 0.06;
    const marginTop = height * 0.12;
    const marginBottom = height * 0.18;
    ctx.strokeRect(marginX, marginTop, width - marginX * 2, height - marginTop - marginBottom);
    ctx.setLineDash([]);
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
