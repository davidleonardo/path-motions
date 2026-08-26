# PathMotion — Product Requirements Document (PRD)

**Project Name:** PathMotion  
**Working Title:** Open-Source Timeline Route-to-Video Visualizer  
**Document Version:** 2.0  
**Status:** Implementation-Ready PRD  
**Reference Date:** August 2026  
**Primary Language:** English  
**License Target:** Open-source application; prefer permissive FOSS dependencies  
**Deployment Model:** Static web application / PWA, client-side only  
**Primary Repository Output:** A production-ready React + TypeScript application

---

# 1. Executive Summary

PathMotion is a privacy-first, client-side web application that transforms Google Maps location-history exports such as `Timeline.json` and legacy `Records.json` into cinematic, animated travel-route videos.

The product is designed for travelers, runners, cyclists, road-trip users, and social-media creators who want to turn raw location-history data into polished visual stories without uploading their location history to a backend server.

The application must:

1. Import and normalize supported Google location-history JSON formats.
2. Filter invalid or noisy points while preserving meaningful travel.
3. Render an interactive route using MapLibre GL JS.
4. Generate smooth cinematic route animations.
5. Provide automatic camera direction and optional manual keyframe control.
6. Render a configurable HUD containing date, time, location, distance, speed, trip progress, and stop information.
7. Export deterministic, frame-perfect video.
8. Produce downloadable MP4 files directly in the browser when the browser supports H.264 through WebCodecs.
9. Support fallback export formats when MP4/H.264 encoding is not available.
10. Keep route processing local to the browser.
11. Support a strict privacy mode where basemap data can also be supplied locally.
12. Require no application backend, database, authentication service, or paid map API.

The visual standard should feel closer to a polished travel documentary, fitness recap, or modern route-animation product than a simple moving marker on a map.

---

# 2. Product Vision

## 2.1 Vision Statement

> Turn private location history into beautiful cinematic travel stories directly inside the browser.

PathMotion should make a route visually understandable, emotionally engaging, and easy to share.

The application should be usable by a non-technical user while still exposing enough controls for creators who want to customize camera behavior, animation, route styling, and export quality.

---

# 3. Product Principles

## 3.1 Privacy First

Raw location-history JSON must never be uploaded to a PathMotion application server.

All of the following must happen locally:

- file reading;
- JSON parsing;
- normalization;
- filtering;
- route analysis;
- interpolation;
- playback simulation;
- HUD rendering;
- video-frame generation;
- video encoding;
- final file generation.

Important distinction:

Using an online basemap provider may reveal requested map areas to that provider through tile requests even though the raw route JSON is never uploaded.

Therefore PathMotion must provide:

- **Standard Privacy Mode:** route data remains local, but map tiles may come from an external provider.
- **Strict Privacy Mode:** route data and basemap content can both remain local by using a user-supplied/local PMTiles basemap.

The UI must clearly communicate this difference.

---

## 3.2 Zero Application Server

PathMotion must not require:

- REST API;
- GraphQL API;
- server-side rendering;
- user accounts;
- cloud database;
- background job server;
- server-side video encoder;
- telemetry backend;
- cloud storage.

The final production build must be deployable as static assets.

---

## 3.3 Open Technology

Core functionality must use open-source libraries wherever practical.

Avoid hard dependency on:

- Google Maps JavaScript API;
- Mapbox proprietary APIs;
- paid geocoding services;
- paid video-rendering services;
- proprietary server-side video APIs.

---

## 3.4 Deterministic Rendering

Video export must not use screen recording as the primary mechanism.

The output must be generated from a deterministic timeline.

For frame index `i`:

```text
frameTime = i / fps
animationState = evaluateTimeline(frameTime)
render(animationState)
encode(frame)
```

A slow computer may take longer to render the file, but the resulting animation duration, timing, camera motion, and HUD values must remain identical.

---

## 3.5 Creator-Quality Visual Output

Animation quality is a first-class product requirement.

Camera movement, easing, route drawing, labels, stop cards, intro/outro transitions, and HUD animation must be intentionally designed.

The experience must not look like:

- a debug map;
- a GIS tool;
- an unstyled GPS trace;
- a marker simply jumping between points.

---

# 4. Goals

## 4.1 Primary Goals

PathMotion must allow a user to:

- drag and drop a Google Timeline export;
- understand which dates and trips are available;
- select a trip or date range;
- preview the route;
- choose a cinematic visual preset;
- customize duration and aspect ratio;
- preview the animation;
- export a high-quality video;
- download/save the result.

---

## 4.2 Secondary Goals

PathMotion should also support:

- automatic trip segmentation;
- stop detection;
- travel-mode visualization;
- manual route trimming;
- manual camera keyframes;
- privacy-zone redaction;
- local basemap files;
- reusable visual presets;
- local project persistence;
- optional user-supplied soundtrack;
- project export/import.

---

# 5. Non-Goals

The initial product is not intended to be:

- a navigation application;
- a real-time GPS tracker;
- a cloud trip-history service;
- a replacement for Google Maps;
- a collaborative video editor;
- a full non-linear video editor;
- a map-matching/navigation routing engine;
- a cloud-rendering platform;
- a social network.

Road snapping is optional future functionality and must not be required for the first production release.

---

# 6. Target Users

## 6.1 Traveler

Wants to create a recap such as:

- Jakarta → Bandung road trip;
- Japan vacation;
- Europe trip;
- daily city exploration;
- multi-country journey.

Primary needs:

- automatic camera;
- attractive route animation;
- place names;
- social-media aspect ratios;
- simple workflow.

---

## 6.2 Fitness User

Examples:

- runner;
- cyclist;
- walker;
- hiking user.

Primary needs:

- distance;
- speed;
- elapsed time;
- route accuracy;
- route gradient visualization;
- 16:9 and 9:16 exports.

Elevation is optional unless reliable elevation data is explicitly supplied.

---

## 6.3 Content Creator

Primary needs:

- visual presets;
- cinematic camera;
- intro/outro;
- vertical safe areas;
- customizable colors;
- custom title/subtitle;
- optional audio;
- reusable project settings;
- high-quality export.

---

## 6.4 Privacy-Conscious User

Primary needs:

- no route upload;
- strict privacy mode;
- local basemap option;
- location redaction around home/work;
- transparent privacy indicators.

---

# 7. Success Criteria

## 7.1 Functional Success

A new user should be able to:

1. open PathMotion;
2. import a supported JSON file;
3. select a date/trip;
4. click Preview;
5. receive a smooth cinematic animation;
6. export;
7. save a playable video file.

No account creation must be required.

---

## 7.2 Quality Success

For a representative 30-second, 1080p, 30 FPS export:

- exactly 900 frames must be generated;
- no frame may depend on wall-clock rendering speed;
- route and camera states must be reproducible;
- HUD timestamp must match animation state;
- output must contain correct video duration;
- memory must be released after export;
- canceling export must clean up encoder and frame resources.

---

# 8. Recommended Technology Stack

## 8.1 Frontend

Primary recommendation:

- **Vite**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React**

Vite is preferred over Next.js because PathMotion is deliberately client-side only and does not benefit meaningfully from SSR or server actions.

Next.js static export may be supported later, but it is not the default architecture.

---

## 8.2 Map Rendering

Use:

- **MapLibre GL JS**

Responsibilities:

- WebGL map rendering;
- vector/raster basemap rendering;
- route layers;
- markers;
- camera;
- pitch;
- bearing;
- terrain if enabled;
- 3D building layers when supported by the selected style.

Map initialization must support export-safe rendering.

Example conceptual requirement:

```ts
const map = new Map({
  container,
  style,
  center,
  zoom,
  pitch,
  bearing,
  preserveDrawingBuffer: true,
});
```

`preserveDrawingBuffer` should only be enabled where required by the selected capture architecture because it can reduce WebGL performance.

The implementation should encapsulate capture behavior so this option can later be optimized.

---

## 8.3 Basemap Strategy

Basemap source must be abstracted behind a provider interface.

Example:

```ts
interface BasemapProvider {
  id: string;
  name: string;
  styleUrl?: string;
  localStyle?: object;
  requiresNetwork: boolean;
  requiresApiKey: boolean;
  exportSafe: boolean;
  attribution: string;
}
```

### Default Online Provider

Use a provider that:

- is compatible with MapLibre;
- requires no API key;
- supports browser CORS;
- permits the intended usage;
- exposes required attribution.

OpenFreeMap is the recommended initial online provider.

Suggested styles:

- Liberty;
- Positron;
- Bright;
- Dark;
- Fiord;
- 3D where appropriate.

Provider URLs and terms must be configuration, not hardcoded business logic.

### Strict Privacy / Offline Provider

Support:

- **PMTiles**
- local user-selected `.pmtiles` file;
- locally hosted PMTiles asset;
- custom MapLibre style that references the local PMTiles source.

Use the `pmtiles` JavaScript package and MapLibre custom protocol.

### CARTO

CARTO styles may be supported as optional providers, but the core product must not assume that CARTO can be used without a key.

---

# 9. Geospatial Stack

Use:

- `@turf/turf` selectively;
- custom interpolation functions where necessary.

Turf is suitable for:

- distance;
- bearing;
- line slicing;
- bounding boxes;
- centroids;
- point-along-line calculations;
- geospatial helpers.

Do not blindly smooth the entire route using a spline.

A naïve spline can cut across:

- buildings;
- rivers;
- blocks;
- sharp road turns.

PathMotion should preserve raw geometry for statistics and use a separate visualization path for rendering.

---

# 10. Video Stack

Use:

- **WebCodecs API**
- **Mediabunny**

Do not use `mp4-muxer` as the primary implementation.

The export abstraction must support:

```ts
interface VideoExporter {
  probe(config: ExportConfig): Promise<ExportCapability>;
  start(config: ExportConfig): Promise<void>;
  addFrame(frame: VideoFrame, timestampUs: number): Promise<void>;
  finalize(): Promise<ExportResult>;
  cancel(): Promise<void>;
}
```

Primary desired output:

- MP4 container;
- H.264 / AVC when supported by the browser.

Fallback:

- WebM with an available WebCodecs codec when AVC is unavailable.

The UI must run capability detection before export.

---

# 11. State Management

Use:

- Zustand.

Recommended stores:

```text
projectStore
timelineStore
playbackStore
mapStore
editorStore
exportStore
uiStore
```

Avoid putting high-frequency animation state through unnecessary React re-renders.

The animation engine should maintain frame-critical state outside the React reconciliation path where appropriate.

---

# 12. Validation

Use:

- TypeScript strict mode;
- Zod or equivalent schema validation at external-data boundaries.

Do not assume imported Google JSON always matches one exact structure.

---

# 13. Worker Strategy

Use Web Workers for:

- large-file parsing;
- normalization;
- filtering;
- route segmentation;
- cumulative metrics;
- optional interpolation precomputation.

Where supported and beneficial, use:

- OffscreenCanvas;
- transferable typed arrays.

The main UI thread must remain responsive during import.

---

# 14. High-Level System Architecture

```text
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ React Application                     │  │
│  │                                       │  │
│  │ Import → Trip Editor → Preview        │  │
│  │                    → Export           │  │
│  └───────────────────────────────────────┘  │
│                    │                        │
│         ┌──────────┴──────────┐             │
│         │                     │             │
│         ▼                     ▼             │
│  Web Worker              Playback Engine    │
│  Parse/Normalize         Scene Timeline     │
│  Analyze/Segment         Camera Director    │
│         │                     │             │
│         └──────────┬──────────┘             │
│                    ▼                        │
│            Normalized Trip Model            │
│                    │                        │
│          ┌─────────┴─────────┐              │
│          ▼                   ▼              │
│    MapLibre Renderer      HUD Renderer      │
│          │                   │              │
│          └─────────┬─────────┘              │
│                    ▼                        │
│             Composite Canvas                │
│                    │                        │
│                    ▼                        │
│            Deterministic Frames             │
│                    │                        │
│                    ▼                        │
│          WebCodecs Video Encoder            │
│                    │                        │
│                    ▼                        │
│               Mediabunny                    │
│                    │                        │
│            MP4 / WebM Container             │
│                    │                        │
│                    ▼                        │
│        Save to Disk / Blob Download         │
└─────────────────────────────────────────────┘
```

---

# 15. Core Domain Model

Raw provider-specific data must not flow directly into map components.

Normalize it first.

```ts
type Coordinate = {
  lat: number;
  lng: number;
};

type TimelinePoint = {
  id: string;
  coordinate: Coordinate;
  timestampMs: number;
  accuracyM?: number;
  altitudeM?: number;
  sourceIndex: number;
};

type TravelMode =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'car'
  | 'train'
  | 'bus'
  | 'motorcycle'
  | 'flight'
  | 'boat'
  | 'unknown';

type RouteSample = TimelinePoint & {
  elapsedMs: number;
  segmentDistanceM: number;
  cumulativeDistanceM: number;
  speedKmh?: number;
  rawBearingDeg?: number;
  visualBearingDeg?: number;
  mode?: TravelMode;
};

type PlaceVisit = {
  id: string;
  name?: string;
  coordinate: Coordinate;
  arrivalMs: number;
  departureMs: number;
  durationMs: number;
  source?: 'timeline' | 'detected' | 'manual';
};

type TripSegment = {
  id: string;
  startMs: number;
  endMs: number;
  mode: TravelMode;
  points: RouteSample[];
  distanceM: number;
};

type NormalizedTrip = {
  id: string;
  title?: string;
  timezone: string;
  startMs: number;
  endMs: number;
  points: RouteSample[];
  segments: TripSegment[];
  visits: PlaceVisit[];
  totalDistanceM: number;
  bounds: [number, number, number, number];
};
```

---

# 16. Import System

## 16.1 Supported Inputs

PathMotion must implement an adapter-based parser.

Initial adapters:

```text
GoogleTimelineOnDeviceAdapter
GoogleTakeoutRecordsAdapter
GenericLocationArrayAdapter (optional)
```

The parser must detect known shapes rather than relying only on filename.

Supported examples may include:

- modern Google Timeline export structures;
- legacy Takeout `Records.json`;
- records containing E7 coordinates;
- decimal latitude/longitude;
- numeric and ISO timestamps.

---

## 16.2 File Handling

Support:

- drag and drop;
- file picker;
- files larger than 50 MB;
- visible parsing progress;
- cancel import.

Do not use:

```ts
await file.text()
JSON.parse(...)
```

as the only strategy for every large file.

For large files, architecture should allow:

- worker-based parsing;
- incremental/streaming parsing where practical;
- minimized object duplication.

---

## 16.3 Coordinate Normalization

Support E7 conversion:

```ts
lat = latitudeE7 / 1e7;
lng = longitudeE7 / 1e7;
```

Validate:

```text
-90 <= latitude <= 90
-180 <= longitude <= 180
```

Reject non-finite values.

---

# 17. Data Cleaning

## 17.1 Basic Cleaning

Remove or flag:

- invalid coordinates;
- invalid timestamps;
- exact duplicate points;
- duplicate timestamp + coordinate records;
- records with impossible numeric values.

---

## 17.2 Accuracy Filter

Default:

```text
Maximum accepted accuracy: 50 m
```

The value must be configurable.

Do not discard a point solely because accuracy metadata is absent.

---

## 17.3 Outlier Detection

Do not use a single universal speed limit to delete points because legitimate trips may contain flights or high-speed rail.

Instead classify suspicious points based on:

- previous distance;
- next distance;
- elapsed time;
- isolated geometry spike;
- neighboring speed consistency;
- detected/known travel mode.

Outliers should be:

- removed automatically only when confidence is high;
- otherwise flagged for review.

---

## 17.4 Route Gaps

Detect large gaps using:

- time gap;
- geographic gap;
- missing samples.

A gap should produce a route break rather than an artificial line across a city or country unless the user explicitly chooses to connect it.

---

# 18. Trip Segmentation

Automatically identify meaningful trips.

Signals:

- extended stop duration;
- route gaps;
- activity transitions;
- date boundaries;
- long discontinuities.

Users must be able to:

- select one detected trip;
- merge trips;
- split a trip;
- select arbitrary date/time range.

---

# 19. Stop Detection

If explicit place visits exist in source data, prefer them.

Otherwise infer stops using configurable logic.

Example:

```text
candidate radius <= 100 m
minimum dwell >= 5 min
```

The algorithm should cluster nearby stationary samples and derive:

- arrival;
- departure;
- duration;
- centroid.

Users may:

- rename a stop;
- hide a stop;
- add a manual stop;
- remove a false stop.

---

# 20. Timezone Handling

Timezone correctness matters for travel across regions.

Store source timestamps in UTC internally where possible.

Presentation should support:

- local timezone from timestamp/source if available;
- chosen project timezone;
- UTC fallback.

A trip crossing timezones must not make animation time move backwards.

---

# 21. Privacy Editing

Before preview/export, users must be able to hide sensitive areas.

Provide a Privacy Zones editor.

A privacy zone contains:

```ts
type PrivacyZone = {
  id: string;
  center: Coordinate;
  radiusM: number;
  behavior: 'hide' | 'trim' | 'blur-path';
};
```

Common use:

- hide first 300 m near home;
- hide last 300 m near home;
- remove workplace stop;
- hide a hotel location.

Privacy transformations apply to the exported visualization, not to the source file.

---

# 22. Visualization Geometry

Maintain two geometries:

```text
Raw Geometry
    Used for statistics and source fidelity.

Visual Geometry
    Used only for animation/rendering.
```

Never calculate official trip distance from an aggressively smoothed visual line.

---

# 23. Route Interpolation

## 23.1 Required Behavior

Movement between recorded points must be smooth.

Use:

- time-aware interpolation;
- centripetal Catmull-Rom where appropriate;
- linear interpolation for short segments;
- curve-strength limits around sharp corners.

---

## 23.2 Smoothing Safety

Smoothing must preserve:

- endpoints;
- stop coordinates;
- hard route breaks;
- large direction changes.

Provide smoothing levels:

```text
Off
Low
Balanced
Cinematic
```

Default:

```text
Balanced
```

---

# 24. Playback Timeline Engine

The playback engine is the single source of truth for preview and export.

It must be independent of browser rendering speed.

Core function:

```ts
evaluatePlaybackState(videoTimeSec): PlaybackState
```

Example output:

```ts
type PlaybackState = {
  videoTimeSec: number;
  progress: number;
  sourceTimestampMs: number;
  coordinate: Coordinate;
  bearingDeg: number;
  speedKmh: number;
  cumulativeDistanceM: number;
  activeSegmentId?: string;
  activeVisitId?: string;
  camera: CameraState;
  scene: SceneState;
};
```

Preview and export must both use this evaluator.

---

# 25. Time Compression

A 12-hour trip should not require a 12-hour video.

PathMotion must map source time to video time.

Supported modes:

### Uniform

Compress source duration linearly.

### Motion Weighted

Give more screen time to moving sections.

### Story Mode

Automatically allocate:

- intro;
- route sections;
- important stops;
- transitions;
- outro.

### Manual

Allow creator keyframes.

---

# 26. Recommended Story Timing

For a 30-second default travel video:

```text
0.0s – 2.0s    Intro / overview
2.0s – 25.0s   Main route animation
25.0s – 28.0s  Final destination / route overview
28.0s – 30.0s  Outro statistics
```

The director may modify this according to trip complexity.

---

# 27. Cinematic Scene Director

This is a core differentiating feature.

The scene director automatically converts the normalized trip into cinematic scenes.

Example:

```ts
type SceneType =
  | 'intro-overview'
  | 'follow'
  | 'chase'
  | 'top-down'
  | 'orbit-stop'
  | 'wide-context'
  | 'destination-arrival'
  | 'outro-summary';

type Scene = {
  id: string;
  type: SceneType;
  startSec: number;
  endSec: number;
  cameraProfile: CameraProfile;
  transitionIn: TransitionType;
  transitionOut: TransitionType;
};
```

---

# 28. Automatic Camera Modes

## 28.1 Overview

Used for:

- intro;
- outro;
- long geographic jumps.

Behavior:

- fit entire route;
- moderate pitch;
- slow initial zoom;
- optional route preview.

---

## 28.2 Follow Camera

Camera center follows the current coordinate.

Use a forward look-ahead offset so the marker is not always exactly centered.

The route should have more visible space ahead than behind.

---

## 28.3 Chase Camera

Suitable for:

- road trips;
- cycling;
- running.

Behavior:

- higher pitch;
- heading aligned;
- marker positioned below center;
- dynamic zoom based on movement.

---

## 28.4 Top-Down

Useful for:

- dense city routes;
- complicated turns;
- walking segments.

Pitch:

```text
0°–20°
```

---

## 28.5 Cinematic Tilt

Pitch:

```text
45°–65°
```

Use primarily on:

- longer road sections;
- scenic route transitions;
- lower-curvature sections.

---

## 28.6 Orbit Stop

At major place visits:

- slow camera rotation around the place;
- route motion pauses or slows;
- place label fades in;
- dwell duration is displayed if enabled.

Orbit must be optional because excessive use can feel distracting.

---

# 29. Camera Motion Model

Camera behavior must be calculated from route context, not only current bearing.

Inputs may include:

- current coordinate;
- look-ahead coordinate;
- route curvature;
- current speed;
- next stop distance;
- scene type;
- aspect ratio.

Example:

```text
High speed + low curvature:
    zoom out slightly
    pitch higher
    longer look-ahead

Low speed + city route:
    zoom in
    lower pitch
    reduced rotation

Approaching stop:
    slow camera changes
    zoom toward destination
    reduce bearing movement
```

---

# 30. Bearing Stabilization

Raw GPS bearing is noisy.

Calculate visual bearing using:

- route look-ahead;
- shortest-angle interpolation;
- low-pass filtering;
- maximum angular velocity.

Example constraint:

```text
normal rotation <= 45 degrees/sec
cinematic transition <= 90 degrees/sec
```

Avoid unnecessary 180° flips.

---

# 31. Camera Easing

Supported easing functions:

- linear;
- easeInOutCubic;
- easeOutCubic;
- easeInOutQuint;
- custom cubic Bézier.

Default cinematic camera:

```text
easeInOutCubic
```

Camera easing must be evaluated mathematically from timeline time.

Do not rely on MapLibre's wall-clock animation APIs during deterministic export.

For export, use exact states through `jumpTo` or equivalent direct state application.

---

# 32. Camera Keyframe Editor

Advanced users should be able to override automatic camera.

A keyframe may contain:

```ts
type CameraKeyframe = {
  timeSec: number;
  center?: Coordinate;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  easing?: EasingPreset;
};
```

UI:

- Add keyframe;
- remove keyframe;
- reset to Auto Director;
- drag keyframe on timeline;
- edit zoom/pitch/bearing.

---

# 33. Route Rendering

Use multiple MapLibre layers to create depth.

Recommended stack:

```text
1. Future route shadow
2. Future route faint line
3. Completed route outer glow
4. Completed route main line
5. Completed route highlight core
6. Moving marker halo
7. Moving marker
```

---

# 34. Animated Route Reveal

The route should visually draw behind the moving marker.

Do not rebuild an entire large GeoJSON object every frame if avoidable.

Investigate efficient approaches such as:

- line-progress expressions;
- pre-sliced geometry;
- feature-state;
- controlled source updates.

Performance must be benchmarked.

---

# 35. Route Glow

Create glow using layered lines rather than heavy post-processing.

Example:

```text
outer glow:
    width 12–24 px
    low opacity

middle glow:
    width 6–12 px
    medium opacity

core:
    width 2–5 px
    high opacity
```

Scale widths for output resolution.

---

# 36. Route Color Modes

Support:

- solid;
- neon;
- activity color;
- speed gradient;
- segment color;
- monochrome;
- custom.

Example activity defaults:

```text
Walking   → green family
Cycling   → cyan family
Driving   → blue family
Train     → violet family
Flight    → amber family
```

Actual theme colors must be driven by design tokens rather than hardcoded across components.

---

# 37. Moving Marker

Marker presets:

- dot;
- pulsing circle;
- navigation arrow;
- car;
- bicycle;
- runner;
- plane;
- train;
- minimal pin.

Marker animations may include:

- pulse;
- scale breathing;
- glow;
- heading rotation;
- arrival bounce.

Animation must remain tasteful.

---

# 38. Activity Transitions

When travel mode changes:

Example:

```text
walking → train
```

Possible animation:

1. current marker fades;
2. route color transitions;
3. new marker icon scales in;
4. HUD activity label changes;
5. camera profile changes smoothly.

---

# 39. Place Visit Animation

When arriving at a significant stop:

- route marker decelerates visually;
- destination ring expands;
- place card fades/slides in;
- map may orbit or zoom;
- dwell duration may display;
- route resumes.

Card example:

```text
Shibuya Crossing
Tokyo, Japan
Visited 19:42 • 38 min
```

Do not require reverse geocoding.

Use place names from source data when available or manual user labels.

---

# 40. Intro Scene

Configurable intro elements:

- trip title;
- date range;
- city/country;
- total distance;
- route overview.

Animation:

```text
map fade-in
route overview reveal
title fade/slide
camera begins movement
```

---

# 41. Outro Scene

Configurable statistics:

- total distance;
- trip duration;
- number of stops;
- cities visited;
- travel modes;
- start → destination;
- custom caption.

The final camera should normally show either:

- full route; or
- final destination.

---

# 42. HUD Rendering

HUD must be rendered to the final composite canvas.

Do not rely on DOM screenshots as the primary export path.

HUD elements:

- date;
- clock;
- elapsed trip time;
- cumulative distance;
- current speed;
- activity icon;
- place label;
- progress bar;
- trip title;
- optional attribution;
- optional watermark/logo supplied by the user.

---

# 43. HUD Style Presets

Provide:

### Minimal

Small, clean, low-contrast.

### Glass

Semi-transparent panels with blur-like visual treatment.

### Sport

Large speed/distance emphasis.

### Travel Film

Title/places emphasized.

### Neon

Dark panel with glowing accent.

### None

Map-only.

---

# 44. HUD Safe Areas

Aspect-ratio-specific layouts are mandatory.

For 9:16:

- keep key content away from common social UI zones;
- important text should stay inside configurable safe guides;
- marker should not permanently sit underneath HUD elements.

Provide a toggle:

```text
Show Social Safe Guides
```

Guides do not appear in exported output.

---

# 45. Typography

Use open fonts or system fonts.

Recommended default:

- Inter;
- Geist;
- system fallback.

Optional cinematic title:

- an open licensed display font.

Font assets should be bundled or loaded in a privacy-conscious way.

Avoid export dependence on a remote font request that may fail halfway through rendering.

---

# 46. Visual Presets

Initial presets:

## Dark Neon

- dark basemap;
- cyan/blue route;
- glow;
- glass HUD;
- cinematic chase camera.

## Clean Minimal

- light basemap;
- simple route;
- low pitch;
- minimal HUD.

## Midnight Drive

- dark basemap;
- warmer road line;
- higher camera pitch;
- car-focused visuals.

## Travel Film

- neutral map;
- place cards;
- smooth wide camera;
- title/outro emphasis.

## Fitness

- high route contrast;
- distance/speed HUD;
- less dramatic camera rotation.

## Satellite-Like / Custom

Only offer satellite imagery when a legally usable provider/source is explicitly configured.

Do not silently use proprietary satellite endpoints.

---

# 47. Optional Motion Effects

Support carefully:

- route pulse;
- destination ripple;
- soft vignette;
- subtle grain;
- edge glow;
- animated compass;
- speed lines for high-speed mode;
- map dimming behind place cards.

Avoid excessive effects that reduce map readability.

---

# 48. Composite Renderer

Final video frames must come from one controlled compositor.

Concept:

```text
MapLibre WebGL Canvas
        +
Overlay Canvas
        +
Optional effects
        ↓
Final Composition Canvas
        ↓
VideoFrame
```

Recommended:

```ts
ctx.drawImage(mapCanvas, 0, 0, width, height);
drawHud(ctx, playbackState);
drawOverlayEffects(ctx, playbackState);
```

All frame-critical fonts/assets must be loaded before export begins.

---

# 49. Preview Engine

Preview should use:

```ts
requestAnimationFrame()
```

but calculate animation state from the timeline evaluator.

Preview may skip frames on slow devices.

It must not alter the logical animation duration.

Controls:

- play;
- pause;
- restart;
- playback speed;
- scrubber;
- frame/scene stepping for editor mode.

---

# 50. Scrubber

Scrubber must support:

- seek;
- drag;
- keyboard arrows;
- current time;
- total video duration;
- scene markers;
- camera keyframes;
- place visit markers.

During scrubbing, camera animation should update immediately without inertia.

---

# 51. Export Settings

## 51.1 Aspect Ratios

Required:

```text
16:9
9:16
1:1
```

Optional:

```text
4:5
21:9
```

---

## 51.2 Resolution Presets

### 16:9

- 1280 × 720
- 1920 × 1080
- 2560 × 1440
- 3840 × 2160 when device capability allows

### 9:16

- 720 × 1280
- 1080 × 1920
- 1440 × 2560 where supported

### 1:1

- 1080 × 1080
- 1440 × 1440

Default:

```text
1920 × 1080 or 1080 × 1920
```

depending on aspect ratio.

---

# 52. Frame Rate

Required:

```text
30 FPS
60 FPS
```

Default:

```text
30 FPS
```

60 FPS should show a performance warning on constrained devices.

---

# 53. Duration

Presets:

```text
15 sec
30 sec
45 sec
60 sec
90 sec
Custom
```

Default:

```text
30 sec
```

---

# 54. Video Codec Capability Detection

Before enabling MP4 export:

```ts
await VideoEncoder.isConfigSupported(...)
```

Probe a prioritized set of AVC configurations.

Do not assume a single AVC profile works everywhere.

Example strategy:

```text
1. Preferred H.264 profile
2. More compatible H.264 profile
3. Lower resolution/bitrate H.264
4. Fallback format such as WebM
```

UI must show:

```text
MP4 H.264 supported
MP4 H.264 unavailable
WebM fallback available
```

---

# 55. Encoding Configuration

Recommended starting values, subject to capability probing:

```text
Codec: H.264 / AVC
FPS: 30
Keyframe interval: approximately every 2 seconds
Latency mode: quality-oriented when supported
```

Bitrate presets may approximately target:

```text
720p30    5–8 Mbps
1080p30   8–16 Mbps
1080p60   12–24 Mbps
1440p30   16–28 Mbps
4K30      30–60 Mbps
```

Actual defaults should be tuned after quality testing.

---

# 56. Deterministic Export Algorithm

Pseudo-flow:

```ts
await preloadExportAssets();
await ensureMapReady();
await initializeEncoder();

for (let i = 0; i < totalFrames; i++) {
  if (abortSignal.aborted) break;

  const timeSec = i / fps;
  const state = timeline.evaluate(timeSec);

  applyMapState(state);
  await waitForMapFrame();

  compositor.render(state);

  const timestampUs = Math.round((i * 1_000_000) / fps);

  const frame = new VideoFrame(compositeCanvas, {
    timestamp: timestampUs,
    duration: Math.round(1_000_000 / fps),
  });

  try {
    await waitForEncoderBackpressure();
    encoder.encode(frame, {
      keyFrame: i % keyframeIntervalFrames === 0,
    });
  } finally {
    frame.close();
  }

  reportProgress(i + 1, totalFrames);
}

await encoder.flush();
await finalizeContainer();
await releaseResources();
```

---

# 57. Map Frame Readiness

Export must not encode an incomplete map frame.

Before export:

- load style;
- load sprites;
- load glyphs;
- prefetch likely route tiles where feasible;
- verify CORS compatibility;
- wait until required assets are available.

Per frame:

- apply exact camera state;
- trigger map repaint if needed;
- wait for the corresponding render cycle;
- then composite.

Do not wait for network-dependent `idle` if that produces unnecessary stalls once assets are already ready.

Implement a dedicated `MapFrameBarrier`.

---

# 58. Export Preflight

Before rendering frame 1, validate:

- output resolution;
- browser encoder support;
- selected codec;
- estimated frame count;
- memory risk;
- destination write capability;
- basemap export safety;
- fonts loaded;
- marker images loaded;
- local tiles available if strict privacy mode;
- no unresolved missing assets.

Example result:

```ts
type ExportPreflight = {
  canExport: boolean;
  warnings: string[];
  errors: string[];
  codec?: string;
  estimatedFrames: number;
  estimatedOutputBytes?: number;
};
```

---

# 59. Encoder Backpressure

Do not enqueue unlimited frames.

Monitor:

- `VideoEncoder.encodeQueueSize`;
- output stream backpressure;
- memory pressure where measurable.

The render loop must pause when encoder backlog is too large.

---

# 60. Resource Cleanup

Every export must guarantee cleanup.

Required:

```text
VideoFrame.close()
ImageBitmap.close() when used
VideoEncoder.close()
Object URL revoke
AbortController cleanup
worker message cleanup
temporary canvas release where possible
Map event handler cleanup
```

Cleanup must also happen after:

- cancel;
- codec failure;
- basemap failure;
- thrown exception.

Use `try/finally`.

---

# 61. Direct-to-Disk Export

Preferred on supporting browsers:

```text
File System Access API
        ↓
FileSystemWritableFileStream
        ↓
Mediabunny StreamTarget
```

Benefits:

- lower memory usage;
- suitable for large exports;
- output can be streamed progressively.

Suggested UX:

```text
Export MP4
→ browser asks where to save
→ rendering writes directly to selected file
```

---

# 62. Blob Download Fallback

When direct-to-disk is unavailable:

```text
Mediabunny BufferTarget
→ ArrayBuffer
→ Blob
→ URL.createObjectURL
→ <a download>
```

After download initiation:

```ts
URL.revokeObjectURL(url);
```

Large-output warnings are required when using in-memory mode.

---

# 63. Download UX

After successful export:

Show:

- filename;
- duration;
- resolution;
- FPS;
- codec;
- approximate size;
- `Save Video` / `Download Video`;
- `Export Again`.

Default filename:

```text
pathmotion-YYYY-MM-DD-trip-title-1080p.mp4
```

Sanitize unsupported filename characters.

---

# 64. Optional Audio

Phase 2 or advanced V1:

Allow local audio import:

- MP3;
- AAC;
- WAV;
- compatible formats supported by decoding pipeline.

Capabilities:

- trim;
- start offset;
- volume;
- fade-in;
- fade-out.

Audio must remain local.

PathMotion must not bundle copyrighted commercial music.

---

# 65. Attribution

Map-data/style attribution must comply with the selected provider/license.

The application must:

- display attribution in interactive preview;
- optionally burn required attribution into exported video;
- prevent hiding attribution when the selected map license requires it.

Attribution should be readable but unobtrusive.

---

# 66. User Experience Flow

```text
Welcome
  ↓
Import
  ↓
Analyze
  ↓
Select Trip / Range
  ↓
Customize
  ↓
Preview
  ↓
Fine Tune
  ↓
Export Preflight
  ↓
Render
  ↓
Save / Download
```

---

# 67. Welcome Screen

Components:

- PathMotion logo/title;
- short privacy statement;
- dropzone;
- `Choose Timeline File`;
- supported format hint;
- `Use Demo Data`;
- `Strict Privacy Mode` explanation.

No registration prompt.

---

# 68. Import Progress

Example:

```text
Reading file...
Parsing records... 42%
Normalizing coordinates...
Analyzing 218,430 points...
Detecting trips...
Ready
```

Large-file parsing must not freeze the interface.

---

# 69. Trip Browser

After import, show:

- calendar/date range;
- detected trips;
- start/end time;
- distance;
- duration;
- stop count;
- approximate bounding area.

Users should be able to click a trip and see it immediately on the map.

---

# 70. Main Editor Layout

Desktop:

```text
┌────────────────────────────────────────────────────────────┐
│ Top Toolbar                                                │
├──────────────┬─────────────────────────────────────────────┤
│ Control      │                                             │
│ Panel        │             Map / Video Canvas              │
│              │                                             │
│              │                                             │
├──────────────┴─────────────────────────────────────────────┤
│ Timeline / Scrubber / Scenes / Keyframes                  │
└────────────────────────────────────────────────────────────┘
```

---

# 71. Control Panel

Sections:

## Data

- selected trip;
- date/time range;
- smoothing;
- stop detection;
- privacy zones.

## Story

- video duration;
- Auto Director;
- scene intensity;
- stop emphasis.

## Camera

- automatic/manual;
- pitch style;
- follow strength;
- look-ahead;
- keyframes.

## Visual

- basemap;
- theme;
- route color;
- route thickness;
- glow;
- marker;
- 3D buildings.

## HUD

- layout;
- date/time;
- speed;
- distance;
- progress;
- place cards;
- attribution.

## Output

- aspect ratio;
- resolution;
- FPS;
- codec;
- quality.

---

# 72. Animation Intensity

Provide a single high-level control:

```text
Calm
Balanced
Cinematic
Dynamic
```

This adjusts multiple parameters together.

Example:

### Calm

- low pitch;
- slower bearing change;
- minimal orbit;
- reduced zoom movement.

### Cinematic

- dynamic zoom;
- 45–60° pitch;
- place arrival emphasis;
- moderate scene transitions.

### Dynamic

- stronger camera variation;
- more frequent scene changes;
- higher route glow;
- stronger arrival animation.

Default:

```text
Cinematic
```

---

# 73. Editor Timeline

Track rows:

```text
Scenes
Route
Stops
Camera
HUD
Audio (optional)
```

The first implementation may keep editing simple while maintaining this domain model.

---

# 74. Undo / Redo

Editing operations should support undo/redo.

Examples:

- route trimming;
- stop removal;
- camera keyframe edit;
- privacy-zone modification;
- style change.

Do not include playback progress or export progress in undo history.

---

# 75. Project Persistence

Store project metadata locally.

Recommended:

- IndexedDB for larger serialized project state;
- localStorage only for lightweight preferences.

Do not persist the entire raw location file without explicit user choice.

A project may store:

- source fingerprint;
- selected range;
- theme;
- scenes;
- keyframes;
- privacy edits;
- export settings.

---

# 76. Project Import / Export

Allow:

```text
Export PathMotion Project
```

Suggested extension:

```text
.pathmotion.json
```

The file should contain editing configuration and optionally normalized route data if the user explicitly chooses.

Privacy warning required before embedding route data.

---

# 77. Browser Support Strategy

WebCodecs video encoding is not universally available.

PathMotion must perform runtime feature detection.

Recommended product tiers:

### Full Support

- WebGL/MapLibre;
- Web Workers;
- WebCodecs;
- required codec;
- canvas export.

### Partial Support

- preview works;
- MP4 unavailable;
- fallback export may work.

### Unsupported

- no required WebGL/canvas capabilities.

Do not hide failures behind generic error messages.

---

# 78. Compatibility Check Screen

Before first export, optionally display:

```text
Map rendering          ✓
WebCodecs              ✓
H.264 encoding         ✓
Direct-to-disk save    ✓
Hardware acceleration  Best effort
```

When unavailable:

```text
H.264 encoding         ✕
Fallback: WebM         ✓
```

---

# 79. Performance Requirements

## 79.1 Import

Target:

- 50 MB JSON without UI freeze;
- 100+ MB supported on desktop-class devices where memory permits.

---

## 79.2 Preview

Target:

- 60 FPS UI on typical recent desktop hardware at standard preview resolution;
- degrade gracefully to 30 FPS.

Preview resolution may be lower than export resolution.

---

## 79.3 Export

Export may run slower than real time.

Correctness is more important than realtime speed.

The UI must display:

```text
Rendering frame 240 / 900
26.7%
```

Optional:

- elapsed render time;
- estimated remaining time only if calculation is stable.

Do not make ETA a correctness dependency.

---

# 80. Memory Requirements

Avoid:

- storing every rendered RGBA frame;
- converting every frame to PNG;
- accumulating `ImageBitmap`s;
- storing duplicate route arrays.

Preferred:

```text
render one frame
→ encode
→ release frame
→ next frame
```

Use streaming output for large files.

---

# 81. Large Route Optimization

For extremely dense histories:

- preserve original data;
- derive a display-optimized path;
- simplify geometry with a tolerance appropriate to map zoom;
- retain important turns and stop boundaries.

Use multiple levels of detail if needed:

```text
preview geometry
export geometry
statistics geometry
```

---

# 82. Tile Loading Strategy

Export creates predictable camera movement.

Where feasible:

1. sample camera path;
2. estimate needed map tiles;
3. warm browser cache;
4. start deterministic export.

Avoid aggressive bulk downloading from third-party tile services when prohibited by their usage terms.

Strict privacy/offline workflows should use local PMTiles instead.

---

# 83. CORS / Canvas Safety

A basemap provider must be marked `exportSafe` only after validation.

If cross-origin map assets taint the canvas or block capture:

- preview may still work;
- export must be disabled for that provider;
- UI must explain why.

Never discover this only after rendering hundreds of frames.

---

# 84. Accessibility

Editor controls should support:

- keyboard navigation;
- visible focus;
- ARIA labels;
- sufficient contrast;
- reduced-motion option.

`prefers-reduced-motion` should affect editor UI animations.

It does not automatically change exported video unless the user selects a reduced-motion export preset.

---

# 85. Responsive Behavior

Primary editing target:

- desktop;
- laptop;
- large tablet.

Mobile:

- import;
- trip selection;
- preview;
- basic settings.

High-resolution export on mobile may be restricted based on capability.

---

# 86. Error Handling

Define typed error categories:

```ts
type PathMotionErrorCode =
  | 'UNSUPPORTED_FILE'
  | 'INVALID_TIMELINE'
  | 'NO_VALID_POINTS'
  | 'MAP_LOAD_FAILED'
  | 'MAP_EXPORT_UNSAFE'
  | 'CODEC_UNSUPPORTED'
  | 'ENCODER_FAILED'
  | 'OUT_OF_MEMORY'
  | 'SAVE_FAILED'
  | 'EXPORT_CANCELLED';
```

Every user-visible failure must provide a recovery action.

---

# 87. Privacy Requirements

PathMotion must not include third-party analytics by default.

If analytics is ever added:

- it must be optional;
- it must never contain route coordinates;
- it must never include imported filenames;
- it must never contain place names;
- it should preferably be disabled in self-hosted builds.

---

# 88. Security Requirements

- Never execute content from imported JSON.
- Treat place names and metadata as untrusted text.
- Sanitize strings used in UI.
- Do not inject source metadata through `dangerouslySetInnerHTML`.
- Define a Content Security Policy suitable for static deployment where practical.
- Avoid remote scripts.
- Pin dependency versions through lockfile.
- Run dependency/security checks in CI.

---

# 89. Design System

Use reusable tokens.

```ts
type ThemeTokens = {
  background: string;
  foreground: string;
  accent: string;
  routeMain: string;
  routeGlow: string;
  routeFuture: string;
  hudBackground: string;
  hudForeground: string;
  stopAccent: string;
};
```

Visual presets should produce tokens, not duplicate styles.

---

# 90. Suggested Project Structure

```text
pathmotion/
├── public/
│   ├── icons/
│   ├── fonts/
│   ├── demo/
│   └── map/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── import/
│   │   │   ├── TimelineDropzone.tsx
│   │   │   ├── ImportProgress.tsx
│   │   │   └── ImportSummary.tsx
│   │   ├── editor/
│   │   │   ├── EditorLayout.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── TimelineEditor.tsx
│   │   │   └── CameraKeyframeEditor.tsx
│   │   ├── map/
│   │   │   ├── MapViewport.tsx
│   │   │   ├── MapRenderer.ts
│   │   │   └── RouteLayers.ts
│   │   ├── hud/
│   │   │   ├── HudPreview.tsx
│   │   │   └── hudRenderer.ts
│   │   ├── export/
│   │   │   ├── ExportDialog.tsx
│   │   │   ├── ExportProgress.tsx
│   │   │   └── ExportComplete.tsx
│   │   └── privacy/
│   │       └── PrivacyZoneEditor.tsx
│   │
│   ├── domain/
│   │   ├── timeline.ts
│   │   ├── trip.ts
│   │   ├── scene.ts
│   │   ├── camera.ts
│   │   ├── project.ts
│   │   └── export.ts
│   │
│   ├── parsers/
│   │   ├── detectTimelineFormat.ts
│   │   ├── GoogleTimelineOnDeviceAdapter.ts
│   │   ├── GoogleTakeoutRecordsAdapter.ts
│   │   └── normalizeTimeline.ts
│   │
│   ├── workers/
│   │   ├── timeline.worker.ts
│   │   └── workerProtocol.ts
│   │
│   ├── geo/
│   │   ├── distance.ts
│   │   ├── bearing.ts
│   │   ├── interpolation.ts
│   │   ├── smoothing.ts
│   │   ├── segmentation.ts
│   │   ├── stopDetection.ts
│   │   └── privacyZones.ts
│   │
│   ├── playback/
│   │   ├── TimelineEngine.ts
│   │   ├── SceneDirector.ts
│   │   ├── CameraDirector.ts
│   │   ├── CameraInterpolator.ts
│   │   └── PlaybackController.ts
│   │
│   ├── rendering/
│   │   ├── CompositeRenderer.ts
│   │   ├── HudCanvasRenderer.ts
│   │   ├── OverlayRenderer.ts
│   │   ├── AssetManager.ts
│   │   └── MapFrameBarrier.ts
│   │
│   ├── basemaps/
│   │   ├── BasemapProvider.ts
│   │   ├── openFreeMap.ts
│   │   ├── pmtiles.ts
│   │   └── custom.ts
│   │
│   ├── video/
│   │   ├── capabilityProbe.ts
│   │   ├── VideoExportEngine.ts
│   │   ├── MediabunnyMuxer.ts
│   │   ├── exportPreflight.ts
│   │   ├── outputTarget.ts
│   │   └── bitratePresets.ts
│   │
│   ├── stores/
│   │   ├── projectStore.ts
│   │   ├── timelineStore.ts
│   │   ├── playbackStore.ts
│   │   ├── editorStore.ts
│   │   └── exportStore.ts
│   │
│   ├── persistence/
│   │   ├── indexedDb.ts
│   │   └── projectFile.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── utils/
│   │   ├── abort.ts
│   │   ├── math.ts
│   │   ├── time.ts
│   │   └── file.ts
│   │
│   └── main.tsx
│
├── tests/
│   ├── fixtures/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.js
├── README.md
└── PRD.md
```

---

# 91. Recommended Core Dependencies

Conceptual dependency set:

```text
react
react-dom
typescript
vite
tailwindcss
lucide-react
zustand
zod
maplibre-gl
@turf/turf
pmtiles
mediabunny
```

Optional:

```text
idb
comlink
react-dropzone
date-fns
```

Avoid adding libraries when native browser APIs or small internal utilities are sufficient.

---

# 92. Functional Requirements

## FR-001 Import

The system shall import a supported Timeline JSON file without uploading it.

## FR-002 Format Detection

The system shall identify the input schema before normalization.

## FR-003 Worker Parsing

Files exceeding the configured threshold shall be parsed outside the main UI thread.

## FR-004 Trip Discovery

The system shall generate candidate trips/date ranges.

## FR-005 Route Preview

The selected route shall appear on MapLibre.

## FR-006 Playback

The route marker, route reveal, camera, and HUD shall animate using the shared timeline engine.

## FR-007 Scrubbing

The user shall seek to arbitrary video time.

## FR-008 Cinematic Director

The system shall automatically generate camera scenes from route characteristics.

## FR-009 Manual Camera

The user shall be able to override the camera with keyframes.

## FR-010 HUD

The system shall render configurable HUD elements.

## FR-011 Place Visits

The system shall render detected/imported place stops.

## FR-012 Privacy Zones

The user shall be able to remove/hide route sections near sensitive coordinates.

## FR-013 Aspect Ratio

The system shall support 16:9, 9:16, and 1:1.

## FR-014 FPS

The system shall support 30 and 60 FPS where feasible.

## FR-015 MP4

The system shall export H.264 MP4 when supported by the browser.

## FR-016 Fallback Export

The system shall offer a compatible fallback when H.264 is unavailable.

## FR-017 Export Progress

The system shall display deterministic frame progress.

## FR-018 Cancel Export

The user shall be able to cancel rendering safely.

## FR-019 Save Video

The final output shall be saved directly to disk when supported or downloaded via Blob fallback.

## FR-020 Offline Basemap

The system shall support local PMTiles for strict privacy workflows.

## FR-021 Attribution

The system shall render mandatory map attribution.

## FR-022 Presets

The system shall provide reusable animation and visual presets.

## FR-023 Project Persistence

The editor shall preserve project settings locally.

## FR-024 Project File

The user shall be able to export/import project configuration.

---

# 93. Non-Functional Requirements

## NFR-001 Privacy

No raw route file shall be sent to a PathMotion backend.

## NFR-002 No Backend

Core application functionality shall operate from static hosting.

## NFR-003 Determinism

Export results shall not depend on rendering wall-clock speed.

## NFR-004 Responsiveness

Large-file parsing shall not freeze the main thread for long periods.

## NFR-005 Cleanup

Media and canvas resources shall be explicitly released.

## NFR-006 Browser Capability

Unsupported codec situations shall be detected before export.

## NFR-007 Recoverability

Failures shall provide actionable recovery messages.

## NFR-008 Maintainability

Provider-specific parsers shall be isolated from normalized domain logic.

## NFR-009 Testability

Timeline, camera, and scene calculations shall be pure/deterministic wherever practical.

## NFR-010 Accessibility

Primary editor actions shall be keyboard accessible.

---

# 94. Export Acceptance Criteria

A 30-second 30 FPS project must:

- generate exactly 900 video frames;
- generate monotonically increasing timestamps;
- close every created `VideoFrame`;
- flush encoder before finalizing the container;
- generate a playable final file;
- display correct width/height;
- display approximately 30 seconds of duration;
- contain no stale frame after seeking;
- preserve route/HUD synchronization.

---

# 95. Animation Acceptance Criteria

The default Cinematic preset must:

- avoid marker teleportation between valid neighboring points;
- avoid uncontrolled camera bearing flips;
- keep the marker visible;
- maintain useful forward map context;
- slow camera behavior around stops;
- animate route reveal continuously;
- use eased scene transitions;
- generate a readable intro;
- generate a readable destination/outro;
- remain visually usable in both 16:9 and 9:16.

---

# 96. Parser Acceptance Criteria

For each supported fixture:

- detect correct adapter;
- normalize coordinate order correctly;
- sort timestamps;
- deduplicate records;
- handle missing accuracy;
- preserve original source index;
- calculate cumulative distance deterministically;
- generate stable results across repeated runs.

---

# 97. Privacy Acceptance Criteria

- importing a route must not make an application API request containing route data;
- strict privacy mode must not request online map tiles;
- privacy zones must affect preview and export identically;
- source JSON must remain unchanged;
- local persisted data must be documented to the user.

---

# 98. Testing Strategy

## 98.1 Unit Tests

Test:

- E7 conversion;
- timestamp parsing;
- distance;
- bearing;
- shortest-angle interpolation;
- smoothing;
- segmentation;
- stop detection;
- time mapping;
- camera easing;
- scene generation;
- privacy trimming;
- filename generation.

---

## 98.2 Parser Fixtures

Maintain sanitized fixtures for:

- legacy Records;
- modern Timeline;
- missing accuracy;
- duplicate timestamps;
- malformed records;
- large coordinate jumps;
- multiple travel modes;
- multi-day trip;
- timezone boundary;
- empty route.

Do not commit real private location history.

---

## 98.3 Integration Tests

Test:

```text
JSON
→ normalize
→ trip
→ timeline
→ camera
→ frame state
```

and:

```text
frame state
→ compositor
→ encoder
→ container
```

---

## 98.4 E2E Tests

Use Playwright or equivalent for:

- import;
- select trip;
- preview;
- scrub;
- switch ratio;
- export capability;
- small video export;
- cancel export.

---

# 99. Visual Regression

Maintain deterministic screenshot checkpoints at:

```text
0%
25%
50%
75%
100%
```

for a fixed demo route.

Compare:

- route reveal;
- marker;
- camera;
- HUD;
- place card;
- attribution.

---

# 100. Performance Benchmarks

Create benchmark fixtures approximately representing:

```text
10k points
100k points
500k points
1M points
```

Track:

- parse time;
- normalization time;
- memory;
- preview FPS;
- export frames/sec;
- output size.

Performance results should be documented rather than guessed.

---

# 101. Milestone 0 — Technical Feasibility Spike

Before implementing the complete editor, prove:

1. MapLibre frame can be reliably captured.
2. The selected basemap is export-safe.
3. A deterministic 5-second route can render.
4. WebCodecs can encode frames.
5. Mediabunny can produce a playable MP4.
6. The MP4 can be saved/downloaded.
7. 9:16 output works.
8. route and HUD compositing works.

Deliverable:

```text
Technical spike demo: 5-second deterministic MP4
```

This milestone de-risks the hardest technical requirement first.

---

# 102. Milestone 1 — Application Foundation

Deliver:

- Vite;
- React;
- TypeScript strict;
- Tailwind;
- Zustand;
- MapLibre;
- core layout;
- error boundary;
- worker setup;
- test setup.

---

# 103. Milestone 2 — Import & Normalization

Deliver:

- dropzone;
- format detection;
- Google adapters;
- worker parsing;
- progress;
- filtering;
- route metrics;
- trip list.

Definition of Done:

User can load a real supported export and inspect a static route.

---

# 104. Milestone 3 — Interactive Map Editor

Deliver:

- route layers;
- stops;
- markers;
- basemap selection;
- trip/date range;
- privacy editor;
- map controls.

---

# 105. Milestone 4 — Playback Engine

Deliver:

- shared deterministic timeline evaluator;
- route interpolation;
- marker movement;
- route reveal;
- scrubber;
- play/pause;
- speed;
- synchronization tests.

---

# 106. Milestone 5 — Cinematic Camera Director

Deliver:

- overview;
- follow;
- chase;
- top-down;
- stop arrival;
- look-ahead;
- dynamic zoom;
- bearing stabilization;
- scene generation;
- cinematic transitions.

This milestone should receive dedicated visual tuning.

---

# 107. Milestone 6 — HUD & Story Layer

Deliver:

- clock/date;
- distance;
- speed;
- place card;
- activity;
- progress;
- intro;
- outro;
- style presets;
- aspect-ratio safe layouts.

---

# 108. Milestone 7 — Deterministic Video Export

Deliver:

- capability probe;
- WebCodecs encoder;
- Mediabunny MP4;
- map frame barrier;
- compositor;
- progress;
- cancel;
- resource cleanup;
- Blob download.

---

# 109. Milestone 8 — Large Export & Direct Save

Deliver:

- File System Access API save path;
- Mediabunny stream output;
- backpressure;
- memory safeguards;
- large export warning;
- output metadata.

---

# 110. Milestone 9 — Strict Privacy

Deliver:

- PMTiles protocol;
- local basemap file;
- strict offline rendering;
- provider status indicator;
- privacy documentation.

---

# 111. Milestone 10 — Creator Polish

Deliver:

- presets;
- manual camera keyframes;
- advanced animation controls;
- project persistence;
- project import/export;
- optional audio;
- visual-regression tuning.

---

# 112. Recommended MVP Scope

A realistic high-quality MVP should include:

- one modern Timeline adapter;
- legacy Records adapter;
- route filtering;
- trip range selection;
- OpenFreeMap;
- MapLibre;
- balanced smoothing;
- route reveal;
- moving marker;
- Auto Director;
- basic cinematic follow camera;
- intro/outro;
- clock/distance HUD;
- 16:9 + 9:16;
- 1080p;
- 30 FPS;
- H.264 MP4 capability probe;
- Mediabunny export;
- download/save;
- export progress;
- resource cleanup.

Do not delay MVP by implementing every advanced editor feature.

---

# 113. Phase 2

Potential Phase 2:

- 60 FPS optimization;
- 4K;
- audio;
- manual camera keyframes;
- richer scene editor;
- 3D buildings;
- terrain;
- privacy zones;
- local PMTiles;
- project files;
- custom user branding.

---

# 114. Phase 3

Potential future features:

- optional offline road matching;
- GPX import;
- Strava-compatible GPX/FIT workflows where legally appropriate;
- GeoJSON import;
- multiple trips in one story;
- photo timeline overlays;
- user-supplied image pins;
- map-to-photo transitions;
- travel chapter titles;
- multi-route comparison;
- desktop wrapper using Tauri.

---

# 115. Known Risks

## Risk: Timeline Schema Changes

Mitigation:

- adapter architecture;
- fixture-based tests;
- format detection;
- user-friendly unsupported-schema diagnostics.

---

## Risk: H.264 Browser Support

Mitigation:

- capability probe;
- multiple AVC configs;
- fallback container/codec;
- compatibility UI.

---

## Risk: Canvas Export / CORS

Mitigation:

- provider export-safe validation;
- preflight;
- local PMTiles option.

---

## Risk: Large Memory Consumption

Mitigation:

- worker parsing;
- frame-at-a-time rendering;
- explicit cleanup;
- direct-to-disk stream output;
- geometry LOD.

---

## Risk: Map Tiles Missing During Export

Mitigation:

- asset readiness stage;
- tile warming where permitted;
- frame barrier;
- offline tiles for strict/reliable mode.

---

## Risk: Spline Distorts Route

Mitigation:

- separate raw and visual geometry;
- conservative smoothing;
- preserve stops/turns;
- selectable smoothing strength.

---

## Risk: Camera Causes Motion Sickness

Mitigation:

- rotation-rate cap;
- bearing smoothing;
- Calm preset;
- reduced pitch;
- fewer cuts.

---

# 116. AI Coding Assistant Guardrails

When implementing this PRD, an AI coding assistant must follow these constraints.

## Architecture

- Do not create a backend.
- Do not introduce a database server.
- Do not upload route JSON.
- Do not add authentication unless a future PRD explicitly requires it.
- Keep provider-specific parsing behind adapters.
- Keep animation calculations deterministic.
- Use one timeline evaluator for preview and export.

## Video

- Do not use `MediaRecorder` screen capture as the primary export.
- Do not use deprecated `mp4-muxer` for new implementation.
- Use WebCodecs capability detection.
- Always close `VideoFrame`.
- Implement encoder backpressure.
- Implement cancellation.
- Implement cleanup with `finally`.

## Maps

- Do not introduce Mapbox API dependency.
- Do not introduce Google Maps API dependency.
- Do not assume a provider is free/keyless without configuration.
- Preserve map attribution.
- Validate export CORS before long renders.

## Privacy

- Never log route coordinates to an external service.
- Never send imported location data to analytics.
- Do not store source route persistently without explicit user choice.

## Code Quality

- TypeScript strict mode.
- Avoid `any`.
- Prefer pure functions for geometry/timeline logic.
- Keep React components focused on UI.
- Put animation math in domain/services.
- Add tests with each parser/animation module.

---

# 117. Suggested Implementation Order for AI/Vibe Coding

Use this order:

```text
1. Scaffold
2. Domain types
3. Parser fixtures
4. Parser adapters
5. Normalization
6. Static MapLibre route
7. Timeline evaluator
8. Marker interpolation
9. Route reveal
10. Basic camera
11. Cinematic director
12. HUD canvas renderer
13. Composite canvas
14. 5-second export spike
15. Full export progress/cancel
16. Aspect ratios
17. Presets
18. Large-file worker optimization
19. Direct-to-disk output
20. Strict privacy/offline
21. Advanced editor
```

Do not begin with the full visual editor before proving deterministic export.

---

# 118. Definition of Done — Version 1.0

Version 1.0 is complete when:

- [ ] A user can import supported Google Timeline history.
- [ ] No route JSON is uploaded.
- [ ] Large imports run through a worker.
- [ ] Route data is normalized into one internal model.
- [ ] User can select a trip or date range.
- [ ] Route is rendered on MapLibre.
- [ ] Route animation is smooth.
- [ ] Camera Auto Director produces cinematic motion.
- [ ] Bearing is stable and does not randomly flip.
- [ ] Route reveal is animated.
- [ ] Stops can appear as animated place cards.
- [ ] Date/time and distance HUD render correctly.
- [ ] 16:9 export works.
- [ ] 9:16 export works.
- [ ] 1:1 export works.
- [ ] 1080p export works on capable desktop browsers.
- [ ] 30 FPS export works.
- [ ] 60 FPS can be selected when supported.
- [ ] H.264 capability is checked before export.
- [ ] MP4 is created through WebCodecs + Mediabunny when supported.
- [ ] Fallback export is available when AVC is unavailable.
- [ ] Export progress is visible.
- [ ] Export can be canceled.
- [ ] Media resources are cleaned after export.
- [ ] Completed video can be saved/downloaded.
- [ ] Required map attribution is present.
- [ ] At least five visual presets are available.
- [ ] Automated tests cover parser and timeline core.
- [ ] A demo route produces reproducible visual output.
- [ ] Static production build can run without a backend.

---

# 119. Default Product Configuration

Recommended first-launch defaults:

```yaml
privacyMode: standard
basemap: openfreemap-liberty
animationPreset: cinematic
smoothing: balanced
cameraMode: auto
routeStyle: neon
hudPreset: travel-film
duration: 30
fps: 30
aspectRatio: "9:16"
resolution: "1080x1920"
codecPreference:
  - h264
  - webm-fallback
showPlaces: true
showClock: true
showDistance: true
showSpeed: false
showProgress: true
showAttribution: true
```

For desktop/YouTube-oriented mode, default aspect ratio may instead be 16:9.

---

# 120. Example Cinematic Animation Recipe

For a typical city-to-city road trip:

```text
Scene 1 — Overview
Duration: 2.0 sec
Camera: whole route, pitch 25°
Route: faint full path
HUD: title + date

Scene 2 — Departure
Duration: 2.0 sec
Camera: smooth zoom toward origin
Marker: pulse then appear
Route: glow starts

Scene 3 — Chase
Duration: adaptive
Camera: pitch 55°, bearing follows direction
Marker position: lower-middle
Zoom: dynamic by speed
HUD: distance + time

Scene 4 — Major Turn / City
Duration: adaptive
Camera: slightly wider
Bearing rotation: eased
Place label: optional

Scene 5 — Stop
Duration: 1.5–3.0 sec
Camera: decelerate and orbit 10–20°
Destination ripple
Place card fade-in

Scene 6 — Resume
Camera: transition back to chase
Route reveal continues

Scene 7 — Arrival
Duration: 2.0 sec
Camera: zoom toward final location
Marker: destination pulse
Place card

Scene 8 — Outro
Duration: 2.0 sec
Camera: fit entire route
Route: full glow
HUD: total distance + duration
```

---

# 121. Reference Technical Decisions — August 2026

The implementation should verify current versions before installation, but the following architectural choices are intentional:

1. **MapLibre GL JS** is the map renderer.
2. **Vite + React + TypeScript** is preferred for a pure static application.
3. **OpenFreeMap** is the initial no-key online basemap option.
4. **PMTiles** is the preferred strict-privacy/self-hosted basemap path.
5. **WebCodecs** provides browser video encoding.
6. **Mediabunny** provides MP4/WebM muxing and output targets.
7. **mp4-muxer is not used for new implementation.**
8. Video export is deterministic and frame-based.
9. Direct-to-disk export is preferred when the browser provides the File System Access API.
10. Blob download remains the compatibility fallback.

---

# 122. External Technical References

These links are implementation references, not runtime dependencies.

- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- OpenFreeMap: https://openfreemap.org/
- OpenFreeMap Quick Start: https://openfreemap.org/quick_start/
- PMTiles / Protomaps: https://docs.protomaps.com/pmtiles/
- PMTiles + MapLibre: https://docs.protomaps.com/pmtiles/maplibre
- WebCodecs VideoEncoder: https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder
- Mediabunny: https://mediabunny.dev/
- Mediabunny Writing Media: https://mediabunny.dev/guide/writing-media-files
- Turf.js: https://turfjs.org/

---

# 123. Final Product Statement

PathMotion Version 1 should deliver the following experience:

> A user drops a private Google Timeline file into the browser, chooses a trip, sees an automatically directed cinematic map animation, adjusts the visual style if desired, clicks Export, watches deterministic rendering progress, and receives a polished downloadable travel video—without uploading the route to an application server.

The engineering priority order is:

```text
privacy
→ deterministic correctness
→ animation quality
→ export reliability
→ performance
→ advanced editing complexity
```

The defining product advantage is not simply “route to video.”

It is:

> **Private route data → cinematic story → downloadable video, entirely in the browser.**
