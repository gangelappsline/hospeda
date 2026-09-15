import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/logo";
import { routes } from "@/lib/routes";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Hospeda.",
};

const highlights = [
  { icon: ShieldCheck, text: "Reservas y pagos protegidos de extremo a extremo" },
  { icon: BadgeCheck, text: "Anfitriones e inmuebles verificados uno por uno" },
  { icon: Sparkles, text: "Precios finales transparentes, sin cargos ocultos" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  // La sesión se valida en el backend externo; proxy.ts evita mostrar esta
  // pantalla cuando ya existe una sesión de navegador.
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-1">
      {/* ---------- Panel izquierdo (marca) ---------- */}
      <aside className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/90 via-brand-600/80 to-ink-900/90" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo className="[&_span:last-child]:text-white" />

          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Administra tu hospedaje desde un solo lugar
            </h2>
            <p className="mt-4 text-white/75">
              Reservaciones, propiedades, pagos y huéspedes. Todo sincronizado
              en tiempo real.
            </p>

            <ul className="mt-10 space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/15">
                    <Icon className="size-4" />
                  </span>
                  <span className="pt-1.5">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Hospeda. Todos los derechos reservados.
          </p>
        </div>
      </aside>

      {/* ---------- Formulario ---------- */}
      <main className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link
            href={routes.home}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>

          <div className="mt-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink-900">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Ingresa tus credenciales para entrar al panel administrativo.
          </p>

          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>

          {/* Credenciales de prueba — quitar cuando el backend real esté listo */}
          <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Cuenta de prueba
            </p>
            <p className="mt-2 font-mono text-sm text-ink-700">
              admin@hospeda.com
            </p>
            <p className="font-mono text-sm text-ink-700">Hospeda2026</p>
          </div>

          <p className="mt-8 text-center text-sm text-ink-500">
            ¿Aún no tienes cuenta?{" "}
            <button type="button" className="font-semibold text-brand-500 hover:underline">
              Regístrate gratis
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
