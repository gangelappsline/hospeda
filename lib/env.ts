/** Variables públicas que configuran el cliente del backend externo. */

export const clientEnv = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
  // La URL del frontend es informativa; nunca se usa como base de peticiones.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  /** URL base de la API, sin slash final. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),
} as const;

export const isProduction = clientEnv.appEnv === "production";
