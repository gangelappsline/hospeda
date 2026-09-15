import type { Metadata } from "next";

import { LodgingTypesView } from "@/components/admin/lodging-types-view";

export const metadata: Metadata = { title: "Tipos de alojamiento" };

export default function LodgingTypesPage() {
  return <LodgingTypesView />;
}
