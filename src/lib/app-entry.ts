/**
 * Hard-load entry normalization.
 *
 * Root cause of "Netting opens first":
 * - There is no navigate('/netting') on startup.
 * - The browser tab URL is already `/netting` (refresh / restore / reopen).
 * - `createBrowserRouter()` reads `window.location` at module-eval time.
 * - If that happens while the path is still `/netting`, React mounts Netting
 *   even if we later change the address bar.
 *
 * Call this BEFORE dynamically importing App/router, then client-side NavLink /
 * navigate() after mount can still open `/netting` on explicit clicks.
 */
export const APP_LANDING_PATH = '/dashboard'

export function normalizeAppEntryUrl(): void {
  if (typeof window === 'undefined') return

  const { pathname, search, hash } = window.location

  if (pathname === '/' || pathname === '') {
    window.history.replaceState(
      window.history.state,
      '',
      `${APP_LANDING_PATH}${search}${hash}`,
    )
    return
  }

  // Hard navigation / refresh / restored tab on /netting → Dashboard.
  // In-app sidebar/Review clicks use client routing after mount and still work.
  if (pathname === '/netting' || pathname.startsWith('/netting/')) {
    window.history.replaceState(window.history.state, '', APP_LANDING_PATH)
  }
}
