"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { clearClientSession } from "@/lib/auth/client-session";
import { useCurrentUser } from "@/lib/hooks/use-auth";
import { routes } from "@/lib/routes";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

/**
 * Guard del panel para sesiones emitidas por el backend externo. Como el
 * token no se convierte en una cookie de Next, la protección real de datos la
 * hace la API con Bearer y este guard solo controla la navegación del cliente.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending, error } = useCurrentUser();
  const authError = error instanceof ApiError && error.isAuthError;

  useEffect(() => {
    if (!isPending && (!user || authError)) {
      clearClientSession();
      router.replace(routes.login);
    }
  }, [authError, isPending, router, user]);

  if (isPending || !user || authError) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-50 text-brand-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-7 animate-spin" />
          <span className="text-sm font-medium text-ink-500">Validando sesión…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1 bg-zinc-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} />
        <main className="flex-1 p-5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
