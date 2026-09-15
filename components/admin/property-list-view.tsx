"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  type LucideIcon,
} from "lucide-react";

import { useProperties, type PropertyFilters } from "@/lib/hooks/use-properties";
import type { Property, PropertyStatus } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

const statusLabels: Record<PropertyStatus, string> = {
  publicada: "Publicada",
  borrador: "Borrador",
  revision: "En revisión",
};

const statusStyles: Record<PropertyStatus, string> = {
  publicada: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  borrador: "bg-zinc-100 text-ink-700 ring-zinc-200",
  revision: "bg-amber-50 text-amber-700 ring-amber-200",
};

const fallbackProperties: Property[] = [
  {
    id: "PROP-101",
    title: "Loft Condesa con terraza privada",
    city: "Ciudad de México",
    country: "México",
    pricePerNight: 2100,
    rating: 4.94,
    reviews: 218,
    bedrooms: 2,
    guests: 4,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80",
    propertyType: "Departamento",
  },
  {
    id: "PROP-102",
    title: "Casa frente al mar en Tulum",
    city: "Tulum",
    country: "México",
    pricePerNight: 4500,
    rating: 4.88,
    reviews: 143,
    bedrooms: 3,
    guests: 6,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80",
    propertyType: "Casa",
  },
  {
    id: "PROP-103",
    title: "Cabaña de madera en el bosque",
    city: "Valle de Bravo",
    country: "México",
    pricePerNight: 2300,
    rating: 4.79,
    reviews: 96,
    bedrooms: 2,
    guests: 5,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=500&q=80",
    propertyType: "Cabaña",
  },
  {
    id: "PROP-104",
    title: "Departamento minimalista en Polanco",
    city: "Ciudad de México",
    country: "México",
    pricePerNight: 3750,
    rating: 4.91,
    reviews: 187,
    bedrooms: 1,
    guests: 2,
    status: "revision",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80",
    propertyType: "Departamento",
  },
  {
    id: "PROP-105",
    title: "Hacienda colonial restaurada",
    city: "San Miguel de Allende",
    country: "México",
    pricePerNight: 4650,
    rating: 4.97,
    reviews: 254,
    bedrooms: 5,
    guests: 10,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80",
    propertyType: "Casa",
  },
  {
    id: "PROP-106",
    title: "Suite con alberca infinita",
    city: "Puerto Vallarta",
    country: "México",
    pricePerNight: 3980,
    rating: 4.85,
    reviews: 121,
    bedrooms: 2,
    guests: 4,
    status: "borrador",
    imageUrl:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=500&q=80",
    propertyType: "Hotel boutique",
  },
];

export function PropertyListView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters: PropertyFilters = { search, status, city, propertyType: type };
  const { data, isFetching, isError } = useProperties(filters, fallbackProperties);

  const properties = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? fallbackProperties).filter((property) => {
      const matchesSearch =
        !term ||
        property.title.toLowerCase().includes(term) ||
        property.city.toLowerCase().includes(term) ||
        property.id.toLowerCase().includes(term);
      const matchesStatus = !status || property.status === status;
      const matchesCity = !city || property.city === city;
      const matchesType = !type || property.propertyType === type;
      return matchesSearch && matchesStatus && matchesCity && matchesType;
    });
  }, [city, data, search, status, type]);

  const cities = [...new Set(fallbackProperties.map((property) => property.city))];
  const types = [...new Set(fallbackProperties.map((property) => property.propertyType).filter(Boolean))];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <span>Administración</span>
            <ChevronRight className="size-4" />
            <span className="text-ink-700">Alojamientos</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">Alojamientos</h1>
          <p className="mt-1 text-sm text-ink-500">
            Consulta y filtra todos los alojamientos registrados en Hospeda.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          <Plus className="size-4" />
          Nuevo alojamiento
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total de alojamientos" value="1,847" detail="registrados" icon={Building2} />
        <Summary label="Publicados" value="1,624" detail="88% del catálogo" icon={SlidersHorizontal} />
        <Summary label="En revisión" value="74" detail="requieren atención" icon={Filter} accent />
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o ID…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
              filtersOpen || status || city || type
                ? "border-brand-200 bg-brand-50 text-brand-600"
                : "border-zinc-200 text-ink-700 hover:bg-zinc-50",
            )}
          >
            <Filter className="size-4" />
            Filtros
            {status || city || type ? (
              <span className="grid size-5 place-items-center rounded-full bg-brand-500 text-[11px] text-white">
                {[status, city, type].filter(Boolean).length}
              </span>
            ) : null}
          </button>
          {isFetching ? <Loader2 className="size-4 animate-spin text-brand-500" /> : null}
        </div>

        {filtersOpen ? (
          <div className="grid gap-3 border-b border-zinc-200 bg-zinc-50/70 p-4 sm:grid-cols-3">
            <FilterSelect label="Estado" value={status} onChange={setStatus}>
              <option value="">Todos los estados</option>
              <option value="publicada">Publicada</option>
              <option value="revision">En revisión</option>
              <option value="borrador">Borrador</option>
            </FilterSelect>
            <FilterSelect label="Ciudad" value={city} onChange={setCity}>
              <option value="">Todas las ciudades</option>
              {cities.map((item) => <option key={item}>{item}</option>)}
            </FilterSelect>
            <FilterSelect label="Tipo" value={type} onChange={setType}>
              <option value="">Todos los tipos</option>
              {types.map((item) => <option key={item}>{item}</option>)}
            </FilterSelect>
          </div>
        ) : null}

        {isError ? (
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-800">
            <span className="size-1.5 rounded-full bg-amber-500" />
            No se pudo actualizar el catálogo. Mostrando los últimos datos disponibles.
          </div>
        ) : null}

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Alojamiento</th>
                <th className="px-5 py-3.5 font-semibold">Ubicación</th>
                <th className="px-5 py-3.5 font-semibold">Tipo</th>
                <th className="px-5 py-3.5 font-semibold">Precio / noche</th>
                <th className="px-5 py-3.5 font-semibold">Calificación</th>
                <th className="px-5 py-3.5 font-semibold">Estado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {properties.map((property) => (
                <tr key={property.id} className="transition hover:bg-zinc-50/80">
                  <td className="px-5 py-4">
                    <div className="flex min-w-[260px] items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={property.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900">{property.title}</p>
                        <p className="mt-0.5 text-xs text-ink-500">{property.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-ink-500" />{property.city}</span>
                    <span className="mt-1 block text-xs text-ink-500">{property.country}</span>
                  </td>
                  <td className="px-5 py-4 text-ink-700">{property.propertyType ?? "—"}</td>
                  <td className="px-5 py-4 font-semibold text-ink-900">{formatCurrency(property.pricePerNight)}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 font-medium text-ink-900"><Star className="size-3.5 fill-amber-400 text-amber-400" />{property.rating.toFixed(2)} <span className="text-xs font-normal text-ink-500">({property.reviews})</span></span>
                  </td>
                  <td className="px-5 py-4"><span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", statusStyles[property.status])}>{statusLabels[property.status]}</span></td>
                  <td className="px-5 py-4 text-right"><button type="button" className="text-sm font-semibold text-brand-500 hover:underline">Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {properties.length === 0 ? <EmptyState /> : null}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4 text-sm text-ink-500">
          <span>Mostrando <strong className="font-semibold text-ink-700">{properties.length}</strong> alojamientos</span>
          <div className="flex items-center gap-1"><button type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-ink-500">Anterior</button><button type="button" className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white">1</button><button type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-ink-500">Siguiente</button></div>
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value, detail, icon: Icon, accent = false }: { label: string; value: string; detail: string; icon: LucideIcon; accent?: boolean }) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-ink-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{value}</p><p className={cn("mt-1 text-xs", accent ? "text-amber-600" : "text-ink-500")}>{detail}</p></div><span className={cn("grid size-10 place-items-center rounded-xl", accent ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-500")}><Icon className="size-5" /></span></div></div>;
}

function FilterSelect({ label, children, value, onChange }: { label: string; children: ReactNode; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-1.5 text-xs font-semibold text-ink-700"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-normal text-ink-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">{children}</select></label>;
}

function EmptyState() {
  return <div className="grid place-items-center px-6 py-14 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-ink-500"><Search className="size-5" /></span><p className="mt-3 text-sm font-semibold text-ink-900">No encontramos alojamientos</p><p className="mt-1 text-sm text-ink-500">Prueba con otro término o limpia los filtros.</p></div>;
}
