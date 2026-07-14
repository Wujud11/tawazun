# Deployment Guide — Render (single service)

The frontend and backend are deployed together on one Render Web Service.
Express serves the React build and the API from the same origin.

```
https://tawazun.onrender.com/          → React app
https://tawazun.onrender.com/netting   → React app (client-side routing)
https://tawazun.onrender.com/health    → API health check
https://tawazun.onrender.com/api/ai/*  → API routes
```

---

## Render Web Service Settings

| Field | Value |
|-------|-------|
| Build Command | `npm install && npm run render:build` |
| Start Command | `npm start` |

### Environment variables

| Key | Required | Description |
|-----|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for netting analysis |
| `NODE_ENV` | Auto | Set to `production` by `render.yaml` |

`FRONTEND_URL` and `VITE_API_URL` are not required — frontend and API share the same origin.

---

## Local Development (unchanged)

```bash
npm run dev          # Vite frontend at http://localhost:5173
npm run server:dev   # Express backend at http://localhost:3001
```

Leave `VITE_API_URL` unset locally. The Vite dev-server proxy handles `/api/*`.

---

## Verify Production Build Locally

```bash
npm run render:build
npm start
```

Then open:

- `http://localhost:3001/` — React app
- `http://localhost:3001/health` — `{ "status": "ok", ... }`

---

## Render Free-Tier Note

Free-tier services spin down after 15 minutes of inactivity.
The first request after a cold start can take 30–60 seconds.
