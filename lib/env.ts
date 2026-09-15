/** Variables públicas que configuran el cliente del backend externo. */

export const clientEnv = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /** URL base de la API, sin slash final. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),
} as const;

export const isProduction = clientEnv.appEnv === "production";
