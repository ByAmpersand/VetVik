/**
 * Runtime configuration for the VetVik API client.
 *
 * The base URL can be overridden via a Vite env variable:
 *   VITE_API_BASE_URL=http://localhost:5071
 *
 * If not set, defaults to the local backend launch profile in
 * Server_VetVik/src/VetVik.Api/Properties/launchSettings.json.
 */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const API_BASE_URL: string =
  env.VITE_API_BASE_URL ?? "http://localhost:5071";
