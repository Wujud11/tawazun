/**
 * Base URL for all backend API requests.
 *
 * Local dev  — leave VITE_API_URL unset. Vite's dev-server proxy forwards
 *              every /api/* request to localhost:3001, so a relative path works.
 *
 * Production — set VITE_API_URL to the Render service URL in your frontend
 *              host's environment variables, e.g.:
 *              https://tawazun-api.onrender.com
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
