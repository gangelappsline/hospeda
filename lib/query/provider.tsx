"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ApiError } from "@/lib/api-client";
import { isProduction } from "@/lib/env";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // No reintentar si el token es inválido o expiró.
          if (error instanceof ApiError && error.isAuthError) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: 0 },
    },
  });
}

/**
 * Provider de TanStack Query.
 *
 * El QueryClient se crea con `useState` para que cada usuario/pestaña tenga su
 * propia caché y no se comparta estado entre requests en el servidor.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {!isProduction ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
