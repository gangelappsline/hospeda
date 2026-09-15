import { clientEnv } from "@/lib/env";
import type { ApiErrorShape } from "@/lib/types";

/**
 * Cliente HTTP de Hospeda.
 *
 * - Antepone `NEXT_PUBLIC_API_URL` a cada endpoint.
 * - Envía cookies (`credentials: "include"`) para que viaje la sesión httpOnly.
 * - Aplica timeout con AbortController.
 * - Normaliza cualquier fallo en un `ApiError`.
 */

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number;
  readonly details?: unknown;

  constructor({ message, status, details }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  /** 401/403: la sesión expiró o el token no es válido. */
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Cuerpo en objeto plano; se serializa a JSON automáticamente. */
  body?: unknown;
  /** Token Bearer explícito (útil desde el servidor, donde no hay cookies). */
  token?: string;
  /** Sobrescribe el timeout por defecto, en ms. */
  timeout?: number;
  /** Usa una base distinta a NEXT_PUBLIC_API_URL (ej. rutas internas /api). */
  baseUrl?: string;
}

function buildUrl(endpoint: string, baseUrl?: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const base = (baseUrl ?? clientEnv.apiUrl).replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export async function apiFetch<T>(
  endpoint: string,
  { body, token, timeout, baseUrl, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout ?? clientEnv.apiTimeout,
  );

  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(endpoint, baseUrl), {
      ...init,
      headers: finalHeaders,
      credentials: init.credentials ?? "include",
      signal: init.signal ?? controller.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError({ message: "La petición tardó demasiado.", status: 408 });
    }
    throw new ApiError({
      message: "No se pudo conectar con el servidor de Hospeda.",
      status: 0,
      details: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) return undefined as T;

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : null) ?? `Error ${response.status} al llamar a ${endpoint}`;
    throw new ApiError({ message, status: response.status, details: payload });
  }

  return payload as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "PUT", body }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "PATCH", body }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/** Llama a las rutas internas de Next (`/api/...`) en vez del backend externo. */
export const internalApi = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET", baseUrl: "/api" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", body, baseUrl: "/api" }),
};
