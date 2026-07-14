# Fly.io Deployment Guide

Single-service deployment: Express serves the React build and the API from the same origin.

## Production (Railway)

```
https://tawazun-production-e0ed.up.railway.app/          → React app
https://tawazun-production-e0ed.up.railway.app/netting   → Smart netting (live demo)
https://tawazun-production-e0ed.up.railway.app/health    → API health check
https://tawazun-production-e0ed.up.railway.app/api/ai/*  → API routes
```

## Legacy Fly.io reference

```
https://tawazun.fly.dev/          → React app (deprecated)
https://tawazun.fly.dev/netting   → React app (deprecated)
```

---

## Prerequisites

Install the Fly.io CLI:

```bash
# macOS
brew install flyctl

# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

Log in:

```bash
fly auth login
```

---

## Exact Fly.io Deployment Steps

### 1. Clone and verify locally (optional)

```bash
npm run fly:build
npm start
```

Open:

- `http://localhost:3001/` — React app
- `http://localhost:3001/health` — health check

### 2. Launch the app (first time only)

From the project root:

```bash
fly launch --no-deploy
```

When prompted:

- Use existing `fly.toml` — **Yes**
- App name — accept `tawazun` or choose your own (update `app` in `fly.toml` if changed)
- Region — `fra` (Frankfurt) or closest to your demo audience
- PostgreSQL / Redis — **No**
- Deploy now — **No** (set secrets first)

### 3. Set secrets

```bash
fly secrets set OPENAI_API_KEY="sk-..."
```

Fly injects `PORT=8080` automatically. Do not set `PORT` manually.

### 4. Deploy

```bash
fly deploy
```

### 5. Open the app

```bash
fly open
```

Or visit: `https://tawazun-production-e0ed.up.railway.app/netting`

### 6. Keep the machine warm for demos (optional)

Edit `fly.toml`:

```toml
min_machines_running = 1
```

Then redeploy:

```bash
fly deploy
```

This avoids cold starts but uses paid resources.

---

## Exact Build Command

Inside Docker (defined in `Dockerfile`):

```
npm run fly:build
```

Which runs:

```
npm run build && npm run server:build
```

Produces:

```
dist/index.html          ← React frontend
dist/assets/*            ← frontend assets
dist/server/index.js     ← Express entry point
```

---

## Exact Start Command

```
npm start
```

Which runs:

```
node dist/server/index.js
```

The server listens on `process.env.PORT` (Fly sets `8080`).

---

## Required Environment Variables

### Set via Fly secrets (required)

| Variable | Command | Notes |
|----------|---------|-------|
| `OPENAI_API_KEY` | `fly secrets set OPENAI_API_KEY="sk-..."` | OpenAI API key for netting analysis |

### Set in `fly.toml` (already configured)

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Production mode |

### Automatically provided by Fly (do not set manually)

| Variable | Notes |
|----------|-------|
| `PORT` | Fly sets to `8080`; matches `internal_port` in `fly.toml` |

### Not required for single-service deployment

| Variable | Why |
|----------|-----|
| `FRONTEND_URL` | Frontend and API share the same Fly origin |
| `VITE_API_URL` | Frontend uses relative `/api/*` paths |

---

## Useful Fly Commands

```bash
fly status              # App status
fly logs                # Live logs
fly deploy              # Redeploy after code changes
fly secrets list        # List configured secrets
fly machine list        # List running machines
fly open                # Open app in browser
```

---

## Local Development (unchanged)

```bash
npm run dev          # Vite frontend at http://localhost:5173
npm run server:dev   # Express backend at http://localhost:3001
```

Leave `VITE_API_URL` unset locally. The Vite dev-server proxy handles `/api/*`.

---

## Final Verification Checklist

Replace `<domain>` with your production URL (e.g. `tawazun-production-e0ed.up.railway.app`):

- [ ] `GET https://<domain>/health` returns `200` with `{"status":"ok","timestamp":"..."}`
- [ ] `GET https://<domain>/` returns `200` and loads the React app
- [ ] `GET https://<domain>/netting` returns `200` (SPA routing works)
- [ ] Click **تشغيل المقاصة** — AI analysis completes without network errors
- [ ] `fly logs` shows `[server] running on http://localhost:8080` at startup
- [ ] `fly status` shows machine state `started` and health checks passing
- [ ] No Render or Railway config files remain in the repo

---

## Local Production Build Test

```bash
npm run fly:build
npm start
```

Then open:

- `http://localhost:3001/` — React app
- `http://localhost:3001/health` — health check
- POST `http://localhost:3001/api/ai/netting-analysis` — AI netting (requires `.env` with `OPENAI_API_KEY`)
