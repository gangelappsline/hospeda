/** Claves de caché de TanStack Query, centralizadas para invalidar sin errores. */

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    overview: ["dashboard", "overview"] as const,
  },
  properties: {
    all: ["properties"] as const,
    list: (filters?: object) => ["properties", "list", filters ?? {}] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
  },
  propertyTypes: {
    all: ["property-types"] as const,
    list: ["property-types", "list"] as const,
  },
  colonies: {
    all: ["colonies"] as const,
    list: (filters?: object) => ["colonies", "list", filters ?? {}] as const,
  },
  locations: {
    countries: ["locations", "countries"] as const,
    states: (countryId?: string) => ["locations", "states", countryId ?? ""] as const,
    cities: (stateId?: string) => ["locations", "cities", stateId ?? ""] as const,
  },
} as const;
