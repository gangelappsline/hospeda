"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { LodgingType } from "@/lib/types";

function listPayload<T>(payload: T[] | { items?: T[]; data?: T[]; results?: T[] }) {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? payload.results ?? [];
}

const fallbackLodgingTypes: LodgingType[] = [
  {
    id: 1,
    name: "Casa",
    description: "Casas completas para estancias familiares o grupos.",
    icon_url: "",
  },
  {
    id: 2,
    name: "Departamento",
    description: "Espacios privados dentro de edificios o complejos.",
    icon_url: "",
  },
  {
    id: 3,
    name: "Cabaña",
    description: "Refugios rodeados de naturaleza.",
    icon_url: "",
  },
  {
    id: 4,
    name: "Hotel boutique",
    description: "Habitaciones y suites con servicios incluidos.",
    icon_url: "",
  },
];

/**
 * Catálogo de tipos de alojamiento (`/web/admin/lodging-types`).
 *
 * La lista devuelve `{ id, name, description, icon_url }`. El alta y la
 * edición envían `name`, `description` e `icon` en un FormData multipart,
 * donde `icon` es un archivo de imagen en formato WebP.
 */
export function useLodgingTypes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.lodgingTypes.list,
    queryFn: async () => {
      const payload = await api.get<
        LodgingType[] | { items?: LodgingType[]; data?: LodgingType[] }
      >(routes.api.lodgingTypes);
      return listPayload(payload);
    },
    initialData: fallbackLodgingTypes,
    staleTime: 60 * 1000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.lodgingTypes.all });

  const create = useMutation({
    mutationFn: (body: FormData) =>
      api.post<LodgingType>(routes.api.lodgingTypes, body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormData }) =>
      api.put<LodgingType>(`${routes.api.lodgingTypes}/${id}`, body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(`${routes.api.lodgingTypes}/${id}`),
    onSuccess: invalidate,
  });

  return { ...query, create, update, remove };
}
