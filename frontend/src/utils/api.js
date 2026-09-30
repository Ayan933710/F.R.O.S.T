/**
 * Centralized API / WebSocket base URLs.
 *
 * In production (AWS single-process), VITE_API_URL and VITE_WS_URL are empty
 * strings so the browser uses the *current origin* (same server that serves
 * the page). Locally they fall back to the dev-server defaults.
 *
 * NOTE: We use `?? undefined` instead of `||` because an empty string is a
 * valid "same-origin" value we want to keep — `||` would discard it.
 */

const envApi = import.meta.env.VITE_API_URL;
const envWs  = import.meta.env.VITE_WS_URL;

/** HTTP base — e.g. "http://localhost:5000" or "" (same-origin) */
export const API_BASE = envApi != null && envApi !== undefined
  ? envApi                    // could be "" (same-origin) or a full URL
  : 'http://localhost:5000';  // local-dev fallback

/** WebSocket base — e.g. "ws://localhost:5000" or "" (same-origin, derive from page) */
export const WS_BASE = envWs != null && envWs !== undefined
  ? envWs
  : 'ws://localhost:5000';

/**
 * Build a full WS URL.  When WS_BASE is empty (production), derive the
 * protocol + host from the current page so it works behind any proxy / ELB.
 */
export function wsUrl(path) {
  if (WS_BASE) return WS_BASE + path;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}${path}`;
}
