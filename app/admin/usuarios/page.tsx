import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsersPage() {
  return (
    <PlaceholderPage
      title="Usuarios"
      description="Gestiona huéspedes, anfitriones y permisos del equipo."
      icon={Users}
    />
  );
}
