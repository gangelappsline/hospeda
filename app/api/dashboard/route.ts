import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  dashboardStats,
  featuredProperties,
  recentBookings,
  revenueSeries,
} from "@/lib/mock-data";

/**
 * GET /api/dashboard — datos del panel administrativo.
 * Protegido: exige un token de sesión válido.
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  return NextResponse.json({
    stats: dashboardStats,
    revenue: revenueSeries,
    bookings: recentBookings,
    properties: featuredProperties,
  });
}
