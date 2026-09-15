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
    list: (filters?: Record<string, unknown>) =>
      ["properties", "list", filters ?? {}] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["bookings", "list", filters ?? {}] as const,
  },
} as const;
