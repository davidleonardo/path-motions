# 🎬 PathMotion

> **Privacy-First Timeline Route-to-Video Visualizer**  
> Turn your private Google Maps location history (`Timeline.json`, `Records.json`) into cinematic, animated travel-route videos directly inside your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

- **🔒 100% Client-Side Privacy**: All file parsing, smoothing, map rendering, and video encoding happen locally in your browser memory. No GPS coordinates are ever transmitted over the internet.
- **🗺️ Interactive Map & Route Reveal**: Rendered with **MapLibre GL JS** and OpenFreeMap vector basemaps (no API keys required).
- **📐 Trajectory Math & Smoothing**: *Centripetal Catmull-Rom* spline interpolation, shortest-angle bearing unwrapping to eliminate camera jitter, and automated place dwell clustering (*Stops*).
- **🎥 Cinematic Scene Director**: Automatically crafts storyboards (*Intro Overview* → *Departure* → *Chase/Follow Camera* → *Orbit Stop* → *Outro Summary*).
- **📊 Real-time HUD**: Speedometer (km/h), cumulative distance counter (km), digital clock, trip progress bar, and place visit cards.
- **🎨 5 Visual Theme Presets**:
  - **Dark Neon**: Vibrant cyan laser trails on dark asphalt.
  - **Clean Minimal**: Crisp blue vector line on light positron basemap.
  - **Midnight Drive**: Warm gold road lines with high camera pitch.
  - **Travel Documentary**: Natural tones with prominent landmark stop cards.
  - **Fitness Pro**: Electric emerald pace track with sport metrics.
- **📹 Deterministic Video Export**: Powered by **WebCodecs API** + **Mediabunny** to export frame-perfect **MP4 (H.264)** videos in **16:9** (YouTube), **9:16** (Reels/TikTok), and **1:1** (Square) at 720p, 1080p, 1440p, or 4K.
- **🚀 Built-in Demos**: Includes instant demo routes (*Jakarta → Bandung Scenic Expressway* and *Tokyo Metropolitan Explorer*) to try right away without needing personal GPS logs.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (Recommended: Node.js 20 or 22+)
- npm or pnpm

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/davidleonardo/path-motions.git
cd path-motions

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

Run deterministic geometry and timeline engine validation tests:

```bash
npm test
```

---

## 🌐 Deploy to GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Go to your repository settings on GitHub: **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push to `main` branch: GitHub Actions will automatically build and publish the static app to `https://davidleonardo.github.io/path-motions/`.

---

## 📄 License

MIT License — Created with ❤️ for travelers, creators, and privacy enthusiasts.
