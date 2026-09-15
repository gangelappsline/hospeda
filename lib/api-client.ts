import { clientEnv } from "@/lib/env";
import type { ApiErrorShape } from "@/lib/types";

/**
 * Cliente HTTP del backend externo de Hospeda.
 *
 * Todas las peticiones del navegador se construyen con `NEXT_PUBLIC_API_URL`.
 * El token recibido por login se agrega como Bearer desde el almacenamiento
 * del navegador; no se llama a una ruta `/api` del proyecto de Next.
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

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Token Bearer explícito, útil para peticiones desde un entorno servidor. */
  token?: string;
  timeout?: number;
  /** Solo para integraciones server-to-server muy puntuales. */
  baseUrl?: string;
}

function buildUrl(endpoint: string, baseUrl?: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const base = (baseUrl ?? clientEnv.apiUrl).replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

function getBrowserToken() {
  if (typeof window === "undefined") return undefined;
  return (
    window.localStorage.getItem("hospeda_api_token") ??
    window.sessionStorage.getItem("hospeda_api_token")
  );
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
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");
  if (body !== undefined && !isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  const bearer = token ?? getBrowserToken();
  if (bearer) finalHeaders.set("Authorization", `Bearer ${bearer}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(endpoint, baseUrl), {
      ...init,
      headers: finalHeaders,
      credentials: init.credentials ?? "include",
      signal: init.signal ?? controller.signal,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
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
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text();

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
