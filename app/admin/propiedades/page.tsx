import type { Metadata } from "next";
import { Building2 } from "lucide-react";

import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata: Metadata = { title: "Propiedades" };

export default function PropertiesPage() {
  return (
    <PlaceholderPage
      title="Propiedades"
      description="Publica, edita y revisa el estado de cada inmueble."
      icon={Building2}
    />
  );
}
