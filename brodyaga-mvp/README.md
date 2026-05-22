# БРОДЯГА MVP — Day 1

Mobile-first Next.js + Leaflet prototype focused on immersive fullscreen map navigation.

## What is implemented

- Next.js App Router structure with TypeScript.
- TailwindCSS v4 setup and dark tactical/cyberpunk baseline styles.
- Fullscreen mobile map with OpenStreetMap tiles.
- Geolocation trigger (battery-aware settings with cached position preference).
- Floating action button for "locate me".
- Bottom sheet panel UI for minimal controls.
- Route polyline preview foundation (current position -> tapped destination).
- OpenRouteService scaffold in `src/lib/openRouteService.ts`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use mobile viewport in browser devtools.

## Environment

For OpenRouteService API integration, set:

```bash
NEXT_PUBLIC_ORS_API_KEY=your_key_here
```

Without a key, route preview gracefully falls back to simple start/end segment.

## Day 2 ideas

- Real ORS route fetch on destination confirmation.
- Better map markers and custom icons.
- Bottom sheet interaction states.
- Route instructions and ETA presentation.
- PWA manifest, service worker, and offline tile strategy.
