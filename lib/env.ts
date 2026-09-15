/**
 * Acceso centralizado y tipado a las variables de entorno.
 *
 * Next.js reemplaza `process.env.NEXT_PUBLIC_*` en tiempo de build, por eso se
 * leen de forma literal (no con acceso dinámico tipo process.env[key]).
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno "${name}". Revisa tu archivo .env.local (puedes copiar .env.example).`,
    );
  }
  return value;
}

/** Variables disponibles tanto en el servidor como en el navegador. */
export const clientEnv = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),
} as const;

export const isProduction = clientEnv.appEnv === "production";

/**
 * Variables que solo existen en el servidor.
 * Llamar a esto desde un Client Component lanza un error a propósito.
 */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() solo puede usarse en el servidor.");
  }

  return {
    cookieName: process.env.AUTH_COOKIE_NAME ?? "hospeda_token",
    sessionMaxAge: Number(process.env.AUTH_SESSION_MAX_AGE ?? 604800),
    authSecret: required(
      process.env.AUTH_SECRET ?? (isProduction ? undefined : "hospeda-dev-secret"),
      "AUTH_SECRET",
    ),
    authMode: (process.env.AUTH_MODE ?? "mock") as "mock" | "api",
  } as const;
}

/** Nombre de la cookie de sesión, seguro de leer en cualquier entorno. */
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "hospeda_token";
