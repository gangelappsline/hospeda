import Link from "next/link";
import { House } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

interface LogoProps {
  href?: string;
  className?: string;
  /** Oculta el texto y deja solo el ícono (útil en sidebar colapsada). */
  iconOnly?: boolean;
}

export function Logo({ href = routes.home, className, iconOnly }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
        <House className="size-5" strokeWidth={2.25} />
      </span>
      {!iconOnly ? (
        <span className="text-xl tracking-tight text-brand-500">Hospeda</span>
      ) : null}
    </Link>
  );
}
