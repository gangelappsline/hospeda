import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { getCurrentUser } from "@/lib/auth/session";
import { routes } from "@/lib/routes";

/**
 * Layout protegido del panel administrativo.
 *
 * Aquí ocurre la protección REAL: se verifica la firma y expiración del token
 * en el servidor. El `proxy.ts` solo hace una comprobación rápida previa, así
 * que un usuario con una cookie falsa igual termina en el login.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${routes.login}?redirectTo=${encodeURIComponent(routes.admin.root)}`);
  }

  return (
    <div className="flex min-h-dvh flex-1 bg-zinc-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
