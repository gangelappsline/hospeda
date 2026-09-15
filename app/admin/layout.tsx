import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";

/**
 * El panel usa el token del backend externo. AdminShell valida la sesión en el
 * navegador y cada consulta de datos viaja directamente a NEXT_PUBLIC_API_URL,
 * sin pasar por una ruta `/api` del frontend.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
