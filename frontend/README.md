# F.R.O.S.T Frontend

This directory contains the user interface and edge-client architecture for F.R.O.S.T. (Federated Resilient Operations & Synchronization Technology). It provides high-performance, offline-first dashboards for expedition commanders and headquarters administration.

## Tech Stack & Architecture

* **Core:** React 19 + Vite for ultra-fast HMR and optimized production builds.
* **Styling & UI:** 
  * **Tailwind CSS v4** with custom PostCSS integrations.
  * **Framer Motion** for fluid, hardware-accelerated micro-animations and layout transitions.
  * **CSS Variables Architecture:** A comprehensive Light/Dark mode design system utilizing inline themes (`@theme inline`) and mapped semantic variables (`--bg-primary`, `--accent-primary`, etc.) for seamless theming without layout jank.
* **Offline-First Data & Sync:** 
  * **Yjs (CRDT):** Handles peer-to-peer and client-to-server state resolution when connectivity is spotty.
  * **Local Storage Queue:** Preserves inventory movements and requisitions offline, uploading them incrementally via background sync when connection is restored.
* **Visualization:** 
  * **Three.js / @react-three/fiber:** For 3D geospatial or asset rendering.
  * **Leaflet / React Leaflet:** For map-based geofencing and vessel tracking.
  * **Recharts:** For data-dense telemetry and stock runway charting.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The application will be served via Vite (usually `http://localhost:5173`).

## Key Dashboards

* **Commander Dashboard:** Built for edge nodes (e.g., Maitri Station). Designed for low-bandwidth usage, heavy caching, offline asset requisition, and local inventory ledgering.
* **Admin Dashboard:** Centralized HQ view. Displays multi-station telemetry, approves requisitions, tracks cargo via crypto-hashed manifests, and plans expeditions.

## Structure

* `/src/pages` - Core views (Dashboard, CargoLedger, ExpeditionPlanning, etc.)
* `/src/components` - Reusable UI widgets and layout shells.
* `/src/context` - Global state and theme providers.
* `/src/utils` - CRDT initialization, IndexedDB wrappers, and offline queue logic.
