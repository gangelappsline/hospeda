"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { City, Colony, Country, State } from "@/lib/types";

function arrayPayload<T>(payload: T[] | { items?: T[]; data?: T[]; results?: T[] }) {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? payload.results ?? [];
}

const fallbackCountries: Country[] = [{ id: "mx", name: "México", code: "MX" }];
const fallbackStates: State[] = [
  { id: "cdmx", name: "Ciudad de México", countryId: "mx" },
  { id: "jalisco", name: "Jalisco", countryId: "mx" },
  { id: "quintana-roo", name: "Quintana Roo", countryId: "mx" },
];
const fallbackCities: City[] = [
  { id: "cuauhtemoc", name: "Cuauhtémoc", stateId: "cdmx" },
  { id: "miguel-hidalgo", name: "Miguel Hidalgo", stateId: "cdmx" },
  { id: "guadalajara", name: "Guadalajara", stateId: "jalisco" },
  { id: "tulum", name: "Tulum", stateId: "quintana-roo" },
];
const fallbackColonies: Colony[] = [
  {
    id: "col-001",
    name: "Roma Norte",
    postalCode: "06700",
    countryId: "mx",
    countryName: "México",
    stateId: "cdmx",
    stateName: "Ciudad de México",
    cityId: "cuauhtemoc",
    cityName: "Cuauhtémoc",
  },
  {
    id: "col-002",
    name: "Condesa",
    postalCode: "06140",
    countryId: "mx",
    countryName: "México",
    stateId: "cdmx",
    stateName: "Ciudad de México",
    cityId: "cuauhtemoc",
    cityName: "Cuauhtémoc",
  },
  {
    id: "col-003",
    name: "Aldea Zama",
    postalCode: "77760",
    countryId: "mx",
    countryName: "México",
    stateId: "quintana-roo",
    stateName: "Quintana Roo",
    cityId: "tulum",
    cityName: "Tulum",
  },
];

export function useCountries() {
  return useQuery({
    queryKey: queryKeys.locations.countries,
    queryFn: async () =>
      arrayPayload(
        await api.get<Country[] | { items?: Country[]; data?: Country[] }>(routes.api.countries),
      ),
    initialData: fallbackCountries,
    staleTime: 30 * 60 * 1000,
  });
}

export function useStates(countryId?: string) {
  return useQuery({
    queryKey: queryKeys.locations.states(countryId),
    queryFn: async () => {
      const payload = await api.get<State[] | { items?: State[]; data?: State[] }>(
        `${routes.api.states}?countryId=${encodeURIComponent(countryId ?? "")}`,
      );
      return arrayPayload(payload);
    },
    enabled: Boolean(countryId),
    initialData: countryId === "mx" ? fallbackStates : undefined,
    staleTime: 30 * 60 * 1000,
  });
}

export function useCities(stateId?: string) {
  return useQuery({
    queryKey: queryKeys.locations.cities(stateId),
    queryFn: async () => {
      const payload = await api.get<City[] | { items?: City[]; data?: City[] }>(
        `${routes.api.cities}?stateId=${encodeURIComponent(stateId ?? "")}`,
      );
      return arrayPayload(payload);
    },
    enabled: Boolean(stateId),
    initialData: stateId ? fallbackCities.filter((city) => city.stateId === stateId) : [],
    staleTime: 30 * 60 * 1000,
  });
}

export interface ColonyFilters {
  countryId?: string;
  stateId?: string;
  cityId?: string;
  search?: string;
}

export function useColonies(filters: ColonyFilters) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.colonies.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const payload = await api.get<Colony[] | { items?: Colony[]; data?: Colony[] }>(
        `${routes.api.colonies}${suffix}`,
      );
      return arrayPayload(payload);
    },
    initialData: fallbackColonies,
    staleTime: 30 * 1000,
  });

  const create = useMutation({
    mutationFn: (body: Omit<Colony, "id" | "countryName" | "stateName" | "cityName" | "createdAt">) =>
      api.post<Colony>(routes.api.colonies, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.colonies.all }),
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: Omit<Colony, "countryName" | "stateName" | "cityName" | "createdAt">) =>
      api.put<Colony>(`${routes.api.colonies}/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.colonies.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete<void>(`${routes.api.colonies}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.colonies.all }),
  });

  return { ...query, create, update, remove };
}
