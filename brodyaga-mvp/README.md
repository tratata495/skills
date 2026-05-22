# БРОДЯГА MVP — Day 2

AI-powered urban exploration map companion built with Next.js + Leaflet.

## Implemented in Day 2

- OpenAI route-intent integration via `/api/ai-route` endpoint.
- Natural-language route request input in floating AI panel.
- Model output includes:
  - route preferences JSON
  - atmospheric route summary
  - exploration challenge
- Lightweight fallback parser when API key is absent.
- OpenRouteService polyline fetching wired into map route preview.
- Geolocation status handling improved with clearer fallback states.
- Default map focus changed to Moscow (within MKAD view).
- Mobile-first tactical UI polish for floating panel + bottom sheet.

## Run locally

```bash
npm install
npm run dev
```

## Environment

```bash
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_ORS_API_KEY=your_ors_key
```

If keys are missing, the app still works with graceful AI/route fallback behavior.
