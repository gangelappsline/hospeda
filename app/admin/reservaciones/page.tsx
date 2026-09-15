import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";

import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata: Metadata = { title: "Reservaciones" };

export default function BookingsPage() {
  return (
    <PlaceholderPage
      title="Reservaciones"
      description="Administra check-ins, cancelaciones y pagos de tus huéspedes."
      icon={CalendarCheck}
    />
  );
}
