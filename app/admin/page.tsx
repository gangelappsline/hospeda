import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import {
  dashboardStats,
  featuredProperties,
  recentBookings,
  revenueSeries,
} from "@/lib/mock-data";
import { routes } from "@/lib/routes";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Panel administrativo",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.login);

  // Datos iniciales renderizados en el servidor: la pantalla aparece con
  // contenido y TanStack Query los revalida en el cliente.
  const initialData = {
    stats: dashboardStats,
    revenue: revenueSeries,
    bookings: recentBookings,
    properties: featuredProperties,
  };

  return <DashboardView initialData={initialData} userName={user.name} />;
}
