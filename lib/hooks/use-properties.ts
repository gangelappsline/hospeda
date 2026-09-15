"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { Property } from "@/lib/types";

function listPayload<T>(payload: T[] | { items?: T[]; data?: T[]; results?: T[] }) {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? payload.results ?? [];
}

export interface PropertyFilters {
  search?: string;
  status?: string;
  city?: string;
  propertyType?: string;
}

export function useProperties(filters: PropertyFilters, initialData: Property[] = []) {
  return useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const payload = await api.get<Property[] | { items?: Property[]; data?: Property[] }>(
        `${routes.api.properties}${suffix}`,
      );
      return listPayload(payload);
    },
    initialData,
    staleTime: 30 * 1000,
  });
}
