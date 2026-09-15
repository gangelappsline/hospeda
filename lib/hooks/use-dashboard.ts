"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type {
  Booking,
  DashboardStats,
  Property,
  RevenuePoint,
} from "@/lib/types";

export interface DashboardResponse {
  stats: DashboardStats;
  revenue: RevenuePoint[];
  bookings: Booking[];
  properties: Property[];
}

/** Datos del panel administrativo. */
export function useDashboard(initialData?: DashboardResponse) {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: () => api.get<DashboardResponse>(routes.api.dashboard),
    initialData,
    staleTime: 30 * 1000,
  });
}
