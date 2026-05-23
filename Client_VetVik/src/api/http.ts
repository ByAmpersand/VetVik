import { API_BASE_URL } from "./config";
import { authStorage } from "./authStorage";

export interface ApiErrorPayload {
  status: number;
  title: string;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;
  constructor(message: string, status: number, payload: ApiErrorPayload | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** If true, do not send Authorization header even if a token exists. */
  anonymous?: boolean;
}

function resolveBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/`;
  }
  return "http://localhost:5173/";
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.replace(/^\//, ""), resolveBaseUrl());
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

async function parseErrorPayload(resp: Response): Promise<ApiErrorPayload | null> {
  try {
    const text = await resp.text();
    return text ? (JSON.parse(text) as ApiErrorPayload) : null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, query, anonymous, headers, ...rest } = opts;
  const init: RequestInit = {
    method: "GET",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
  };

  if (!anonymous) {
    const token = authStorage.getValidToken();
    if (token) {
      (init.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const resp = await fetch(buildUrl(path, query), init);

  if (!resp.ok) {
    const payload = await parseErrorPayload(resp);
    if (resp.status === 401) authStorage.clear();
    throw new ApiError(payload?.detail ?? payload?.title ?? `HTTP ${resp.status}`, resp.status, payload);
  }

  if (resp.status === 204) return undefined as T;

  const text = await resp.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const http = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  delete: <T = void>(path: string, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
