import { NextResponse, type NextRequest } from "next/server";

import { api, ApiError } from "@/lib/api-client";
import { findMockUser } from "@/lib/auth/mock-users";
import { setSessionCookie } from "@/lib/auth/session";
import { signToken } from "@/lib/auth/tokens";
import { getServerEnv } from "@/lib/env";
import { routes } from "@/lib/routes";
import type { LoginResponse, User } from "@/lib/types";

/**
 * POST /api/auth/login
 *
 * Según AUTH_MODE:
 *  - "mock": valida contra los usuarios de prueba y firma un token local.
 *  - "api":  delega en el backend real y reusa el token que este devuelva.
 *
 * En ambos casos el token termina en una cookie httpOnly.
 */
export async function POST(request: NextRequest) {
  const { authMode, authSecret, sessionMaxAge } = getServerEnv();

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo de la petición inválido." }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { message: "El correo y la contraseña son obligatorios." },
      { status: 400 },
    );
  }

  let user: User;
  let token: string;
  let expiresAt: string;

  if (authMode === "api") {
    // ---- Backend real ----
    try {
      const data = await api.post<LoginResponse>(routes.api.login, { email, password });
      user = data.user;
      token = data.token;
      expiresAt = data.expiresAt;
    } catch (error) {
      const status = error instanceof ApiError ? error.status || 502 : 502;
      const message =
        error instanceof ApiError ? error.message : "No se pudo contactar al servidor.";
      return NextResponse.json({ message }, { status });
    }
  } else {
    // ---- Modo mock ----
    const found = findMockUser(email, password);
    if (!found) {
      return NextResponse.json(
        { message: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    }
    user = found;
    const signed = await signToken(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      authSecret,
      sessionMaxAge,
    );
    token = signed.token;
    expiresAt = signed.expiresAt;
  }

  await setSessionCookie(token);

  // El token no se devuelve en el JSON: vive solo en la cookie httpOnly.
  return NextResponse.json({ user, expiresAt });
}
