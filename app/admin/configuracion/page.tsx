import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata: Metadata = { title: "Configuración" };

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Configuración"
      description="Ajustes de la cuenta, comisiones, pagos y notificaciones."
      icon={Settings}
    />
  );
}
