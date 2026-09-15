import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { getServerEnv } from "@/lib/env";
import { verifyToken } from "@/lib/auth/tokens";
import type { User } from "@/lib/types";

/**
 * Lectura de la sesión en el servidor (Server Components y Route Handlers).
 *
 * El token vive en una cookie httpOnly, así que el JavaScript del navegador no
 * puede leerlo ni un XSS robarlo.
 */

/** Devuelve el token crudo de la cookie, o null. */
export async function getSessionToken(): Promise<string | null> {
  const { cookieName } = getServerEnv();
  const store = await cookies();
  return store.get(cookieName)?.value ?? null;
}

/**
 * Verifica la firma del token y devuelve el usuario.
 * `cache()` evita re-verificar en cada componente del mismo render.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  const { authSecret } = getServerEnv();
  const payload = await verifyToken(token, authSecret);
  if (!payload) return null;

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
});

/** Escribe la cookie de sesión. Solo desde Route Handlers / Server Actions. */
export async function setSessionCookie(token: string) {
  const { cookieName, sessionMaxAge } = getServerEnv();
  const store = await cookies();

  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
}

/** Borra la cookie de sesión (logout). */
export async function clearSessionCookie() {
  const { cookieName } = getServerEnv();
  const store = await cookies();
  store.delete(cookieName);
}
