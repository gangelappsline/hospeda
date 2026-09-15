import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

/** GET /api/auth/me — devuelve el usuario de la sesión actual. */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
