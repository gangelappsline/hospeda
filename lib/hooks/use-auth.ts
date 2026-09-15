"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { internalApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { LoginCredentials, User } from "@/lib/types";

/** Usuario de la sesión actual, leído desde `/api/auth/me`. */
export function useCurrentUser(initialData?: User) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const data = await internalApi.get<{ user: User }>("/auth/me");
      return data.user;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** Inicia sesión y redirige al panel (o a `redirectTo`). */
export function useLogin(redirectTo: string = routes.admin.root) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      internalApi.post<{ user: User; expiresAt: string }>("/auth/login", credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      router.replace(redirectTo);
      // Refresca los Server Components para que vean la nueva cookie.
      router.refresh();
    },
  });
}

/** Cierra sesión, limpia la caché y vuelve al login. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => internalApi.post<{ success: boolean }>("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      router.replace(routes.login);
      router.refresh();
    },
  });
}
