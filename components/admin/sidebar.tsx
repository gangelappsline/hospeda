"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  ChevronDown,
  LayoutDashboard,
  LifeBuoy,
  List,
  MapPinned,
  Settings,
  Tags,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navigation = [
  { href: routes.admin.root, label: "Resumen", icon: LayoutDashboard },
  { href: routes.admin.bookings, label: "Reservaciones", icon: CalendarCheck },
  {
    href: routes.admin.properties,
    label: "Alojamientos",
    icon: Building2,
    children: [
      { href: routes.admin.properties, label: "Lista", icon: List },
      { href: routes.admin.propertyTypes, label: "Tipos", icon: Tags },
    ],
  },
  { href: routes.admin.users, label: "Usuarios", icon: Users },
  {
    href: routes.admin.settings,
    label: "Configuraciones",
    icon: Settings,
    children: [{ href: routes.admin.colonies, label: "Colonias", icon: MapPinned }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <Logo href={routes.admin.root} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Panel
        </p>

        {navigation.map(({ href, label, icon: Icon, children }) => {
          const isActive =
            href === routes.admin.root
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          const hasChildren = Boolean(children?.length);

          return (
            <div key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink-700 hover:bg-zinc-100 hover:text-ink-900",
                )}
              >
                <Icon className="size-[18px]" />
                <span className="flex-1">{label}</span>
                {hasChildren ? (
                  <ChevronDown className={cn("size-4 transition", isActive && "rotate-180")} />
                ) : null}
              </Link>

              {hasChildren && isActive ? (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-zinc-200 pl-3">
                  {children?.map(({ href: childHref, label: childLabel, icon: ChildIcon }) => {
                    const isChildActive = pathname === childHref;
                    return (
                      <Link
                        key={childHref}
                        href={childHref}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                          isChildActive
                            ? "font-semibold text-brand-600"
                            : "text-ink-500 hover:bg-zinc-50 hover:text-ink-900",
                        )}
                      >
                        <ChildIcon className="size-4" />
                        {childLabel}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <div className="rounded-xl bg-zinc-50 p-4">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-brand-500 shadow-sm">
            <BarChart3 className="size-4" />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink-900">Reportes avanzados</p>
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
