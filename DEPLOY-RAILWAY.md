# Railway Deployment Guide

Single-service deployment: Express serves the React build and the API from the same origin.

```
https://<your-app>.up.railway.app/          → React app
https://<your-app>.up.railway.app/netting   → React app (client-side routing)
https://<your-app>.up.railway.app/health    → API health check
https://<your-app>.up.railway.app/api/ai/*  → API routes
```

---

## Exact Railway Deployment Steps

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select the `tawazun` repository.
4. Railway detects `railway.toml` and applies build/start settings automatically.
5. Open the service → **Variables** → add the required environment variables (see below).
6. Click **Deploy** (or wait for the first deploy from the GitHub push).
7. Open **Settings** → **Networking** → **Generate Domain** to get a public URL.
8. Wait for the deploy to finish (build logs should show Vite + server TypeScript compile).
9. Run the verification checklist at the bottom of this file.

### If `railway.toml` is not picked up

Open the service → **Settings** → **Build** and set manually:

| Field | Value |
|-------|-------|
| Build Command | `npm run railway:build` |
| Start Command | `npm start` |

Open **Settings** → **Deploy** → set **Healthcheck Path** to `/health`.

---

## Exact Build Command

```
npm run railway:build
```

This runs:

```
npm run build && npm run server:build
```

Which produces:

```
dist/index.html          ← React frontend
dist/assets/*            ← frontend assets
dist/server/index.js     ← Express entry point
```

Railway runs `npm install` before the build command automatically.

---

## Exact Start Command

```
npm start
```

Which runs:

```
node dist/server/index.js
```

The server reads `PORT` from the environment (Railway sets this automatically).

---

## Required Environment Variables

Add these in **Railway → your service → Variables**:

| Variable | Required | Value | Notes |
|----------|----------|-------|-------|
| `OPENAI_API_KEY` | **Yes** | `sk-...` | OpenAI API key for netting analysis |
| `NODE_ENV` | Recommended | `production` | Enables production optimizations |

### Automatically provided by Railway (do not set manually)

| Variable | Notes |
|----------|-------|
| `PORT` | Railway injects the port; Express already reads `process.env.PORT` |

### Not required for single-service deployment

| Variable | Why |
|----------|-----|
| `FRONTEND_URL` | Frontend and API share the same Railway origin — CORS not needed |
| `VITE_API_URL` | Frontend uses relative `/api/*` paths — no external API URL needed |

---

## Final Verification Checklist

After deploy completes, replace `<domain>` with your Railway URL.

- [ ] `GET https://<domain>/health` returns `200` with `{"status":"ok","timestamp":"..."}`
- [ ] `GET https://<domain>/` returns `200` and loads the React app
- [ ] `GET https://<domain>/netting` returns `200` (SPA routing works)
- [ ] Click **تشغيل المقاصة** on the netting page — analysis completes without network errors
- [ ] Railway deploy logs show `npm run railway:build` succeeded (Vite + tsc output)
- [ ] Railway deploy logs show `[server] running on http://localhost:<port>` at startup
- [ ] No cold-start delay beyond first deploy (Railway hobby/paid plans stay warm)

---

## Local Production Build Test

```bash
npm run railway:build
npm start
```

Then open:

- `http://localhost:3001/` — React app
- `http://localhost:3001/health` — health check

---

## Local Development (unchanged)

```bash
npm run dev          # Vite frontend at http://localhost:5173
npm run server:dev   # Express backend at http://localhost:3001
```
