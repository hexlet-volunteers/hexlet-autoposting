/**
 * Runtime configuration derived from Vite env vars.
 * `VITE_API_URL` empty -> same-origin (relies on the Vite dev proxy in vite.config.ts).
 */
export const env = {
  // API base. Defaults to the `/api` prefix (proxied to the backend in dev, see
  // vite.config.ts) so SPA client routes never collide with API paths.
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
} as const
