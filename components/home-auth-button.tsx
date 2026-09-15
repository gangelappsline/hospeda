"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

import { useCurrentUser } from "@/lib/hooks/use-auth";
import { routes } from "@/lib/routes";

export function HomeAuthButton() {
  const { data: user } = useCurrentUser();

  return user ? (
    <Link
      href={routes.admin.root}
      className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
    >
      <UserRound className="size-4" />
      Ir al panel
    </Link>
  ) : (
    <Link
      href={routes.login}
      className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
    >
      <UserRound className="size-4" />
      Iniciar sesión
    </Link>
  );
}
