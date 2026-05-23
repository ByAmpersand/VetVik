/**
 * Runtime configuration for the VetVik API client.
 *
 * In dev, requests go through the Vite proxy (`/api` → http://localhost:5071)
 * so the browser stays same-origin and CORS is not required.
 *
 * Override with VITE_API_BASE_URL when calling the API directly, e.g.:
 *   VITE_API_BASE_URL=http://localhost:5071
 */
const env = import.meta.env;

export const API_BASE_URL: string =
  env.VITE_API_BASE_URL ?? (env.DEV ? "" : "http://localhost:5071");
