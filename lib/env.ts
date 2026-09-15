/** Variables públicas que configuran el cliente HTTP del frontend. */

export const clientEnv = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
  // La URL pública se usa únicamente como información de despliegue.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  /** Timeout de las peticiones del navegador al proxy local. */
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),
} as const;

/**
 * Punto de entrada same-origin para todas las llamadas del navegador.
 * El Route Handler correspondiente usa `API_URL` exclusivamente en el servidor.
 */
export const API_PROXY_PATH = "/api";

export const isProduction = clientEnv.appEnv === "production";
