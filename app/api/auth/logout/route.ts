import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth/session";

/** POST /api/auth/logout — borra la cookie de sesión. */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
