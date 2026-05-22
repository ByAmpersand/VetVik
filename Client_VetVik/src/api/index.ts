/**
 * Typed API client for the VetVik backend.
 *
 * Usage:
 *   import { authApi, appointmentsApi } from "@/api";
 *   const auth = await authApi.login({ email, password });
 *   const list = await appointmentsApi.mineOwner();
 *
 * Configuration:
 *   - Base URL: VITE_API_BASE_URL (defaults to http://localhost:5071)
 *   - JWT token is stored in localStorage under "vetvik:auth" by authApi.login/register.
 */

export * from "./config";
export * from "./authStorage";
export * from "./http";
export * from "./types";
export * from "./endpoints";
