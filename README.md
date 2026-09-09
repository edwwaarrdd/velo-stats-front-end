# velo-stats-front-end

A Vue 3 + TypeScript + Tailwind CSS front-end for the [velo-stats-python](../velo-stats-python) API — a summary and browsable history of bike-share rides.

## Features

- **Ride list** with a fun summary header (total rides, time, distance, average speed, cost per ride, savings vs day passes) and a rich card per ride (route, duration, distance, speed, bike number, weather).
- **Ride detail page** with the full breakdown for a single ride, including the complete weather panel (temperature, precipitation, wind, humidity, cloud cover) and computed pace.

## Getting started

The backend (`velo-stats-python`) must be running and reachable — by default at `http://localhost:8000`, configurable via `VITE_API_BASE_URL` in `.env`. The backend needs `django-cors-headers` configured to allow this app's origin (see its `CORS_ALLOWED_ORIGINS` setting).

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## Build

```bash
npm run build
```
