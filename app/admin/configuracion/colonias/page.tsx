import type { Metadata } from "next";

import { ColoniesView } from "@/components/admin/colonies-view";

export const metadata: Metadata = { title: "Colonias" };

export default function ColoniesPage() {
  return <ColoniesView />;
}
