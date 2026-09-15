import type { Metadata } from "next";

import { PropertyTypesView } from "@/components/admin/property-types-view";

export const metadata: Metadata = { title: "Tipos de alojamiento" };

export default function PropertyTypesPage() {
  return <PropertyTypesView />;
}
