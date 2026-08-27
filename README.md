# Ekadashi

A small full-stack web app for tracking **Ekadashi** — the eleventh lunar day
(tithi) of each fortnight in the Hindu lunar calendar, traditionally observed
with fasting and devotion. There are twenty-four Ekadashis in a normal year.

The app shows the **next upcoming Ekadashi** with a countdown and lists all of
the year's observances with their names, paksha (fortnight), Hindu month, and a
short description.

## Stack

- **Backend** — Node.js + [Express](https://expressjs.com/) REST API (`server/`).
- **Frontend** — [React](https://react.dev/) + [Vite](https://vite.dev/) (`client/`).
- **Workspaces** — npm workspaces manage both packages from the repo root.

## Prerequisites

- Node.js `>= 20` (developed against Node 22) and npm.

## Getting started

```bash
npm ci        # install all workspace dependencies
npm run dev   # start the API (:4000) and the web client (:5173) together
```

Then open http://localhost:5173. The Vite dev server proxies `/api/*` requests
to the Express API on port `4000`.

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run API + client together (via `concurrently`). |
| `npm run dev:server` | Run only the Express API with live reload. |
| `npm run dev:client` | Run only the Vite dev server. |
| `npm test` | Run the backend test suite (`node --test`). |
| `npm run build` | Build the client for production. |
| `npm start` | Run the API in production mode. |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check. |
| `GET` | `/api/ekadashis?year=2026` | All Ekadashis for the given year. |
| `GET` | `/api/ekadashis/next` | The next upcoming Ekadashi with `daysUntil`. |

## Data

The Gregorian dates in `server/src/ekadashiData.js` are a curated 2026 reference.
Precise Ekadashi timings depend on regional panchang (almanac) calculations.

## Cloud Agent environment

`.cursor/environment.json` configures the Cursor Cloud Agent environment: `npm ci`
installs dependencies, and two terminals run the API and web dev servers.
