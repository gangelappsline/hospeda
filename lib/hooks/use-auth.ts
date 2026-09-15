"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api-client";
import {
  clearClientSession,
  getStoredToken,
  getStoredUser,
  saveClientSession,
} from "@/lib/auth/client-session";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { LoginCredentials, LoginResponse, User } from "@/lib/types";

/** Usuario actual, consultado a través del proxy same-origin de la aplicación. */
export function useCurrentUser(initialData?: User) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      if (!getStoredToken()) {
        throw new ApiError({ message: "No autenticado.", status: 401 });
      }
      const data = await api.get<{ user: User }>(routes.api.me);
      return data.user;
    },
    initialData: initialData ?? getStoredUser(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** Inicia sesión contra el backend externo y guarda su token en el navegador. */
export function useLogin(redirectTo: string = routes.admin.root) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api.post<LoginResponse>(routes.api.login, credentials),
    onSuccess: (data, variables) => {
      saveClientSession(data.token, data.user, data.expiresAt, variables.remember);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      router.replace(redirectTo);
      router.refresh();
    },
  });
}

/** Cierra sesión contra el backend y limpia el estado local de la aplicación. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ success: boolean }>(routes.api.logout),
    onSettled: () => {
      clearClientSession();
      queryClient.clear();
      router.replace(routes.login);
      router.refresh();
    },
  });
}
