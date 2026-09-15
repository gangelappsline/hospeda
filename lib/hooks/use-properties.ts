"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { Property, PropertyType } from "@/lib/types";

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

const fallbackTypes: PropertyType[] = [
  {
    id: "type-casa",
    name: "Casa",
    description: "Casas completas para estancias familiares o grupos.",
    propertyCount: 642,
    active: true,
  },
  {
    id: "type-departamento",
    name: "Departamento",
    description: "Espacios privados dentro de edificios o complejos.",
    propertyCount: 518,
    active: true,
  },
  {
    id: "type-cabana",
    name: "Cabaña",
    description: "Refugios rodeados de naturaleza.",
    propertyCount: 231,
    active: true,
  },
  {
    id: "type-hotel",
    name: "Hotel boutique",
    description: "Habitaciones y suites con servicios incluidos.",
    propertyCount: 184,
    active: true,
  },
];

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

export function usePropertyTypes() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.propertyTypes.list,
    queryFn: async () => {
      const payload = await api.get<
        PropertyType[] | { items?: PropertyType[]; data?: PropertyType[] }
      >(routes.api.propertyTypes);
      return listPayload(payload);
    },
    initialData: fallbackTypes,
    staleTime: 60 * 1000,
  });

  const create = useMutation({
    mutationFn: (body: Pick<PropertyType, "name" | "description">) =>
      api.post<PropertyType>(routes.api.propertyTypes, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.propertyTypes.all }),
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: Pick<PropertyType, "name" | "description"> & { id: string }) =>
      api.put<PropertyType>(`${routes.api.propertyTypes}/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.propertyTypes.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete<void>(`${routes.api.propertyTypes}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.propertyTypes.all }),
  });

  return { ...query, create, update, remove };
}
