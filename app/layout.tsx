import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { QueryProvider } from "@/lib/query/provider";

export const metadata: Metadata = {
  title: {
    default: "Hospeda — Encuentra tu próximo lugar",
    template: "%s · Hospeda",
  },
  description:
    "Hospeda es la plataforma de hospedaje que conecta viajeros con anfitriones verificados en todo México.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-ink-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
