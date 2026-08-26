import { NormalizedTrip } from '../domain/timeline';
import { Scene } from '../domain/scene';

export class SceneDirector {
  /**
   * Generates a sequence of cinematic scenes for a trip allocated over totalDurationSec.
   */
  public static generateScenes(trip: NormalizedTrip, totalDurationSec: number = 30): Scene[] {
    const scenes: Scene[] = [];
    const introDuration = Math.min(2.5, totalDurationSec * 0.1);
    const outroDuration = Math.min(2.5, totalDurationSec * 0.1);
    const mainMotionDuration = totalDurationSec - introDuration - outroDuration;

    let currentTime = 0;

    // 1. Intro Overview Scene
    scenes.push({
      id: 'scene-intro',
      type: 'intro-overview',
      title: trip.title,
      subtitle: `${(trip.totalDistanceM / 1000).toFixed(1)} km total journey`,
      startSec: currentTime,
      endSec: currentTime + introDuration,
      durationSec: introDuration,
      startProgress: 0,
      endProgress: 0.02,
      cameraProfile: {
        pitch: 25,
        zoomOffset: 0,
        lookAheadM: 100,
        rotationSpeedCapDegPerSec: 45,
        smoothBearing: true,
      },
      transitionIn: 'fade',
      transitionOut: 'smooth',
    });
    currentTime += introDuration;

    // 2. Main motion & stops scenes
    const stops = trip.visits.slice(0, 3); // Emphasize up to top 3 stops
    if (stops.length === 0) {
      // Single continuous chase/follow scene
      scenes.push({
        id: 'scene-main-route',
        type: 'chase',
        startSec: currentTime,
        endSec: currentTime + mainMotionDuration,
        durationSec: mainMotionDuration,
        startProgress: 0.02,
        endProgress: 0.98,
        cameraProfile: {
          pitch: 50,
          zoomOffset: 0,
          lookAheadM: 180,
          rotationSpeedCapDegPerSec: 60,
          smoothBearing: true,
        },
        transitionIn: 'smooth',
        transitionOut: 'smooth',
      });
      currentTime += mainMotionDuration;
    } else {
      const stopDuration = Math.min(2.0, (mainMotionDuration * 0.3) / stops.length);
      const motionSegments = stops.length + 1;
      const motionSegmentDuration = (mainMotionDuration - stops.length * stopDuration) / motionSegments;

      for (let i = 0; i < motionSegments; i++) {
        const segStartProgress = 0.02 + (i / motionSegments) * 0.96;
        const segEndProgress = 0.02 + ((i + 1) / motionSegments) * 0.96;

        scenes.push({
          id: `scene-motion-${i + 1}`,
          type: i % 2 === 0 ? 'chase' : 'follow',
          startSec: currentTime,
          endSec: currentTime + motionSegmentDuration,
          durationSec: motionSegmentDuration,
          startProgress: segStartProgress,
          endProgress: segEndProgress,
          cameraProfile: {
            pitch: 52,
            zoomOffset: 0,
            lookAheadM: 160,
            rotationSpeedCapDegPerSec: 60,
            smoothBearing: true,
          },
          transitionIn: 'smooth',
          transitionOut: 'smooth',
        });
        currentTime += motionSegmentDuration;

        // Add stop orbit scene between motion segments
        if (i < stops.length) {
          const visit = stops[i];
          scenes.push({
            id: `scene-stop-${i + 1}`,
            type: 'orbit-stop',
            title: visit.name,
            subtitle: `Visited • ${Math.round(visit.durationMs / 60000)} min dwell`,
            startSec: currentTime,
            endSec: currentTime + stopDuration,
            durationSec: stopDuration,
            startProgress: segEndProgress,
            endProgress: segEndProgress,
            associatedVisit: visit,
            cameraProfile: {
              pitch: 45,
              zoomOffset: 0.5,
              lookAheadM: 0,
              rotationSpeedCapDegPerSec: 30,
              smoothBearing: false,
            },
            transitionIn: 'smooth',
            transitionOut: 'smooth',
          });
          currentTime += stopDuration;
        }
      }
    }

    // 3. Outro Summary Scene
    scenes.push({
      id: 'scene-outro',
      type: 'outro-summary',
      title: 'Journey Complete',
      subtitle: `${(trip.totalDistanceM / 1000).toFixed(1)} km traveled in ${formatDuration(trip.totalDurationMs)}`,
      startSec: currentTime,
      endSec: totalDurationSec,
      durationSec: totalDurationSec - currentTime,
      startProgress: 0.98,
      endProgress: 1.0,
      cameraProfile: {
        pitch: 25,
        zoomOffset: 0,
        lookAheadM: 0,
        rotationSpeedCapDegPerSec: 45,
        smoothBearing: true,
      },
      transitionIn: 'smooth',
      transitionOut: 'fade',
    });

    return scenes;
  }
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
