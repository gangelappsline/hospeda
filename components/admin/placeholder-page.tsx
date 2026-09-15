import type { LucideIcon } from "lucide-react";

/** Pantalla base para las secciones del panel que aún no se construyen. */
export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>

      <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          <Icon className="size-7" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-ink-900">
          Sección en construcción
        </h2>
        <p className="mt-2 max-w-md text-sm text-ink-500">
          Esta pantalla ya está enrutada y protegida por el token de sesión.
          Aquí conectaremos los datos reales cuando el backend esté disponible.
        </p>
      </div>
    </div>
  );
}
