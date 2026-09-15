import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPinned, Settings } from "lucide-react";

import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Configuración" };

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Configuración</h1>
        <p className="mt-1 text-sm text-ink-500">Administra los catálogos que utiliza Hospeda.</p>
      </div>
      <Link href={routes.admin.colonies} className="group flex max-w-xl items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-md">
        <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-500"><MapPinned className="size-5" /></span>
        <span className="flex-1"><span className="block text-base font-semibold text-ink-900">Colonias</span><span className="mt-1 block text-sm text-ink-500">Gestiona colonias por país, estado, ciudad y código postal.</span></span>
        <ArrowRight className="size-5 text-ink-500 transition group-hover:translate-x-1 group-hover:text-brand-500" />
      </Link>
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-ink-500 mx-auto"><Settings className="size-5" /></span><h2 className="mt-4 text-base font-semibold text-ink-900">Más configuraciones próximamente</h2><p className="mx-auto mt-1 max-w-md text-sm text-ink-500">Los demás catálogos y preferencias de la plataforma aparecerán aquí.</p></div>
    </div>
  );
}
