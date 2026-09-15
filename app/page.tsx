import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  Globe,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { PropertyCard } from "@/components/property-card";
import { HomeAuthButton } from "@/components/home-auth-button";
import { featuredProperties } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

const categories = [
  "Frente al mar",
  "Cabañas",
  "Albercas increíbles",
  "Diseño",
  "Ciudad",
  "Haciendas",
  "Vistas panorámicas",
  "Mascotas bienvenidas",
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Reservas protegidas",
    description:
      "Cada pago está resguardado hasta 24 horas después del check-in. Si el lugar no coincide, te devolvemos el dinero.",
  },
  {
    icon: BadgeCheck,
    title: "Anfitriones verificados",
    description:
      "Validamos identidad, escrituras y calidad del inmueble antes de publicar cualquier propiedad.",
  },
  {
    icon: Sparkles,
    title: "Precios sin sorpresas",
    description:
      "Mostramos el total con impuestos y limpieza desde el primer momento. Sin cargos ocultos al final.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-6">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-700 lg:flex">
            <Link href="#explorar" className="transition hover:text-ink-900">
              Explorar
            </Link>
            <Link href="#beneficios" className="transition hover:text-ink-900">
              Por qué Hospeda
            </Link>
            <Link href="#anfitriones" className="transition hover:text-ink-900">
              Sé anfitrión
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#anfitriones"
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-zinc-100 md:block"
            >
              Pon tu espacio en Hospeda
            </Link>

            <HomeAuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70" />
          </div>

          <div className="mx-auto w-full max-w-5xl px-6 py-28 text-center text-white sm:py-36">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5" />
              Más de 12,000 viajeros hospedados este mes
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Encuentra tu próximo lugar favorito
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-white/85">
              Estancias verificadas, precios transparentes y anfitriones de
              confianza en todo México. Así debería sentirse viajar.
            </p>

            {/* Barra de búsqueda */}
            <div className="mx-auto mt-10 max-w-3xl rounded-full bg-white p-2 shadow-2xl">
              <div className="flex flex-col divide-y divide-zinc-200 sm:flex-row sm:items-center sm:divide-x sm:divide-y-0">
                <label className="flex flex-1 items-center gap-3 px-5 py-3 text-left">
                  <MapPin className="size-5 shrink-0 text-brand-500" />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold text-ink-900">
                      Destino
                    </span>
                    <input
                      type="text"
                      placeholder="¿A dónde vas?"
                      className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
                    />
                  </span>
                </label>

                <label className="flex flex-1 items-center gap-3 px-5 py-3 text-left">
                  <CalendarDays className="size-5 shrink-0 text-brand-500" />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold text-ink-900">
                      Fechas
                    </span>
                    <input
                      type="text"
                      placeholder="Llegada — Salida"
                      className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
                    />
                  </span>
                </label>

                <label className="flex flex-1 items-center gap-3 px-5 py-3 text-left">
                  <Users className="size-5 shrink-0 text-brand-500" />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold text-ink-900">
                      Huéspedes
                    </span>
                    <input
                      type="text"
                      placeholder="Agrega huéspedes"
                      className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
                    />
                  </span>
                </label>

                <button
                  type="button"
                  className="m-2 flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <Search className="size-4" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Categorías + propiedades ---------- */}
        <section id="explorar" className="mx-auto w-full max-w-7xl px-6 py-16">
          <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-4">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  index === 0
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-zinc-300 text-ink-700 hover:border-ink-900 hover:text-ink-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink-900">
                Estancias destacadas
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Seleccionadas por su calificación y calidad de anfitrión.
              </p>
            </div>
            <Link
              href={routes.login}
              className="hidden shrink-0 text-sm font-semibold text-brand-500 hover:underline sm:block"
            >
              Ver todas
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {/* ---------- Beneficios ---------- */}
        <section id="beneficios" className="bg-zinc-50 py-20">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-ink-900">
                Lo que hacemos diferente
              </h2>
              <p className="mt-3 text-ink-500">
                Tomamos lo mejor del hospedaje entre particulares y arreglamos
                lo que siempre incomodó a viajeros y anfitriones.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-200 bg-white p-7 transition hover:shadow-lg"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-500">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA anfitriones ---------- */}
        <section id="anfitriones" className="mx-auto w-full max-w-7xl px-6 py-20">
          <div className="overflow-hidden rounded-3xl bg-ink-900">
            <div className="grid items-center gap-10 p-10 md:grid-cols-2 md:p-14">
              <div className="text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  <Globe className="size-3.5" />
                  Para anfitriones
                </span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Tu espacio puede generar más de lo que imaginas
                </h2>
                <p className="mt-4 text-white/70">
                  Publicar es gratis. Cobramos solo cuando recibes una reserva,
                  con la comisión más baja del mercado y pagos en 24 horas.
                </p>
                <Link
                  href={routes.login}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Comenzar ahora
                </Link>
              </div>

              <dl className="grid grid-cols-2 gap-6">
                {[
                  { value: "1,847", label: "Propiedades activas" },
                  { value: "4.9", label: "Calificación promedio" },
                  { value: "24 h", label: "Pago tras el check-in" },
                  { value: "3%", label: "Comisión por reserva" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
                  >
                    <dt className="text-3xl font-bold text-white">{stat.value}</dt>
                    <dd className="mt-1 text-sm text-white/60">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-ink-500">
            © {new Date().getFullYear()} Hospeda. Hecho en México.
          </p>
        </div>
      </footer>
    </div>
  );
}
