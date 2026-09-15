"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navigation = [
  { href: routes.admin.root, label: "Resumen", icon: LayoutDashboard },
  { href: routes.admin.bookings, label: "Reservaciones", icon: CalendarCheck },
  { href: routes.admin.properties, label: "Propiedades", icon: Building2 },
  { href: routes.admin.users, label: "Usuarios", icon: Users },
  { href: routes.admin.settings, label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <Logo href={routes.admin.root} />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Panel
        </p>

        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === routes.admin.root
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-ink-700 hover:bg-zinc-100 hover:text-ink-900",
              )}
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <div className="rounded-xl bg-zinc-50 p-4">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-brand-500 shadow-sm">
            <BarChart3 className="size-4" />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink-900">
            Reportes avanzados
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Analiza ocupación e ingresos por temporada.
          </p>
        </div>

        <button
          type="button"
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-zinc-100"
        >
          <LifeBuoy className="size-[18px]" />
          Soporte
        </button>
      </div>
    </aside>
  );
}
