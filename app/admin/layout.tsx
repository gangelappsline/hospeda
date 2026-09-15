import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";

/**
 * El panel usa el token emitido por el backend. AdminShell valida la sesión en
 * el navegador y las consultas pasan por la ruta same-origin `/api` de Next.js.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
