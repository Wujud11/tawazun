# Deployment Guide

## Architecture

```
Browser
  └── Frontend (static build — Vercel / Netlify / any static host)
        └── fetch() → VITE_API_URL → Render Web Service (Express)
                                          └── OpenAI API
```

---

## Part 1 — Deploy the Backend to Render

### Step 1 — Push the repository to GitHub

Make sure the latest code (including `render.yaml`) is pushed to GitHub.

```bash
git add .
git commit -m "chore: prepare for Render deployment"
git push
```

### Step 2 — Create a Render Web Service

1. Go to [https://render.com](https://render.com) and sign in.
2. Click **New → Web Service**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` automatically. Confirm the settings:

   | Field | Value |
   |-------|-------|
   | Name | `tawazun-api` |
   | Runtime | Node |
   | Build Command | `npm install && npm run render:build` |
   | Start Command | `npm run server:start` |

> **Existing service (already created via UI)?**
> Render does not re-read `render.yaml` for services created outside the Blueprint
> flow. Go to **Dashboard → your service → Settings → Build & Deploy** and
> manually set:
> - **Build Command:** `npm install && npm run render:build`
> - **Start Command:** `npm run server:start`
> Then click **Save Changes** and trigger a manual deploy.

### Step 3 — Set environment variables in Render

In the Render dashboard → your service → **Environment**, add:

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | Your OpenAI API key (`sk-...`) |
| `FRONTEND_URL` | Your frontend's public URL (set this after Step 4 below) |

> `PORT` is set automatically by Render. Do not set it manually.

### Step 4 — Deploy and note the backend URL

Click **Deploy**. After the build finishes, Render gives you a URL like:

```
https://tawazun-api.onrender.com
```

Copy this URL — you need it in Part 2.

### Step 5 — Verify the backend is alive

```
GET https://tawazun-api.onrender.com/health
```

Expected response:

```json
{ "status": "ok", "timestamp": "..." }
```

---

## Part 2 — Deploy the Frontend (Vercel example)

### Step 1 — Set the backend URL as a build environment variable

In your frontend host (Vercel, Netlify, etc.), add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://tawazun-api.onrender.com` (no trailing slash) |

On Vercel: **Project Settings → Environment Variables**.

### Step 2 — Set the build command

| Field | Value |
|-------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Step 3 — Deploy

Trigger a deploy. The frontend build will embed `VITE_API_URL` at build time so every `fetch()` call goes directly to Render.

### Step 4 — Update FRONTEND_URL on Render

Once the frontend is live, copy its public URL (e.g. `https://tawazun.vercel.app`) and set it as `FRONTEND_URL` in the Render environment variables so CORS allows that origin.

Render will automatically redeploy.

---

## Part 3 — Local Development (unchanged)

No changes to local workflow. Keep both processes running:

```bash
npm run dev          # Vite frontend at http://localhost:5173
npm run server:dev   # Express backend at http://localhost:3001
```

Leave `VITE_API_URL` unset in your local `.env`. The Vite dev-server proxy handles `/api/*` automatically.

---

## Environment Variable Reference

| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `OPENAI_API_KEY` | Render | Yes | OpenAI API key for netting analysis |
| `FRONTEND_URL` | Render | Yes (production) | Frontend public URL added to CORS allowlist |
| `PORT` | Render | Auto | Set by Render automatically |
| `VITE_API_URL` | Frontend host | Yes (production) | Render backend URL, embedded at build time |

---

## Render Free-Tier Note

Render free-tier services spin down after 15 minutes of inactivity.
The first request after a cold start can take 30–60 seconds.
Upgrade to a paid plan to keep the service always-on for a demo.
