/**
 * Base URL for all backend API requests.
 *
 * Local dev  — leave VITE_API_URL unset. Vite's dev-server proxy forwards
 *              every /api/* request to localhost:3001, so a relative path works.
 *
 * Production — leave VITE_API_URL unset when frontend and backend are served
 *              from the same Railway service (same origin).
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
