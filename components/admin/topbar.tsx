"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Search, UserRound } from "lucide-react";

import { useLogout } from "@/lib/hooks/use-auth";
import { routes } from "@/lib/routes";
import type { User } from "@/lib/types";
import { getInitials } from "@/lib/utils";

export function AdminTopbar({ user }: { user: User }) {
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/90 px-5 backdrop-blur sm:px-6">
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
        <input
          type="search"
          placeholder="Buscar reservación, alojamiento o huésped…"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative grid size-10 place-items-center rounded-xl text-ink-700 transition hover:bg-zinc-100"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="flex items-center gap-3 rounded-xl py-1.5 pl-1.5 pr-3 transition hover:bg-zinc-100"
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                {getInitials(user.name)}
              </span>
            )}
            <span className="hidden text-left sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold leading-tight text-ink-900">
                {user.name}
              </span>
              <span className="block text-xs capitalize text-ink-500">{user.role}</span>
            </span>
          </button>

          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10">
                <div className="border-b border-zinc-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="truncate text-xs text-ink-500">{user.email}</p>
                </div>
                <Link
                  href={routes.admin.profile}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink-700 transition hover:bg-zinc-50"
                >
                  <UserRound className="size-4 text-ink-500" />
                  Ver mi perfil
                </Link>
                <button
                  type="button"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="flex w-full items-center gap-2.5 border-t border-zinc-100 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
