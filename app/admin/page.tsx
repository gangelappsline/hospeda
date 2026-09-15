import type { Metadata } from "next";
import {
  dashboardStats,
  featuredProperties,
  recentBookings,
  revenueSeries,
} from "@/lib/mock-data";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Panel administrativo",
};

export default function AdminPage() {
  // Datos de referencia para pintar la pantalla inmediatamente. TanStack Query
  // los revalida mediante el proxy same-origin `/api` en el navegador.
  const initialData = {
    stats: dashboardStats,
    revenue: revenueSeries,
    bookings: recentBookings,
    properties: featuredProperties,
  };

  return <DashboardView initialData={initialData} />;
}
