import type { Metadata } from "next";

import { PropertyListView } from "@/components/admin/property-list-view";

export const metadata: Metadata = { title: "Alojamientos" };

export default function PropertiesPage() {
  return <PropertyListView />;
}
