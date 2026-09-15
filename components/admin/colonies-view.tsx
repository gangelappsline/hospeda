"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ChevronRight,
  Edit3,
  Loader2,
  MapPinned,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  useCities,
  useColonies,
  useCountries,
  useStates,
  type ColonyFilters,
} from "@/lib/hooks/use-colonies";
import type { Colony } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ColonyForm {
  name: string;
  postalCode: string;
  countryId: string;
  stateId: string;
  cityId: string;
}

const emptyForm: ColonyForm = {
  name: "",
  postalCode: "",
  countryId: "",
  stateId: "",
  cityId: "",
};

export function ColoniesView() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [editing, setEditing] = useState<Colony | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const filters: ColonyFilters = {
    search,
    countryId: countryFilter,
    stateId: stateFilter,
    cityId: cityFilter,
  };

  const { data: countries = [] } = useCountries();
  const { data: filterStates = [] } = useStates(countryFilter || undefined);
  const { data: filterCities = [] } = useCities(stateFilter || undefined);
  const { data: colonies = [], isFetching, isError, create, update, remove } = useColonies(filters);

  const [form, setForm] = useState<ColonyForm>(emptyForm);
  const { data: formStates = [] } = useStates(form.countryId || undefined);
  const { data: formCities = [] } = useCities(form.stateId || undefined);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, countryId: countries[0]?.id ?? "" });
    setIsCreating(true);
  };

  const openEdit = (colony: Colony) => {
    setEditing(colony);
    setForm({
      name: colony.name,
      postalCode: colony.postalCode,
      countryId: colony.countryId,
      stateId: colony.stateId,
      cityId: colony.cityId,
    });
    setIsCreating(false);
  };

  const closeForm = () => {
    setEditing(null);
    setIsCreating(false);
    setForm(emptyForm);
  };

  const setField = (field: keyof ColonyForm, value: string) => {
    setForm((current) => {
      if (field === "countryId") return { ...current, countryId: value, stateId: "", cityId: "" };
      if (field === "stateId") return { ...current, stateId: value, cityId: "" };
      return { ...current, [field]: value };
    });
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = {
      name: form.name.trim(),
      postalCode: form.postalCode.trim(),
      countryId: form.countryId,
      stateId: form.stateId,
      cityId: form.cityId,
    };
    if (!body.name || !body.postalCode || !body.countryId || !body.stateId || !body.cityId) return;
    if (editing) update.mutate({ id: editing.id, ...body }, { onSuccess: closeForm });
    else create.mutate(body, { onSuccess: closeForm });
  };

  const mutationError = create.error ?? update.error ?? remove.error;
  const isSaving = create.isPending || update.isPending;
  const normalizedSearch = search.trim().toLowerCase();
  const visibleColonies = colonies.filter((colony) => {
    const matchesSearch =
      !normalizedSearch ||
      colony.name.toLowerCase().includes(normalizedSearch) ||
      colony.postalCode.includes(normalizedSearch);
    return (
      matchesSearch &&
      (!countryFilter || colony.countryId === countryFilter) &&
      (!stateFilter || colony.stateId === stateFilter) &&
      (!cityFilter || colony.cityId === cityFilter)
    );
  });

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500"><span>Configuración</span><ChevronRight className="size-4" /><span className="text-ink-700">Colonias</span></div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">Colonias</h1>
          <p className="mt-1 text-sm text-ink-500">Administra las colonias donde se encuentran tus alojamientos.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"><Plus className="size-4" />Nueva colonia</button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-500"><MapPinned className="size-5" /></span><div><p className="text-sm font-semibold text-ink-900">Catálogo de colonias</p><p className="text-xs text-ink-500">{visibleColonies.length.toLocaleString("es-MX")} registros encontrados</p></div></div><span className="text-xs text-ink-500">Los campos con * son obligatorios</span></div>

      {isError ? <Notice text="No se pudo sincronizar el catálogo. Mostrando los datos disponibles mientras se restablece la conexión." /> : null}
      {mutationError ? <Notice error text={mutationError instanceof ApiError ? mutationError.message : "No se pudo guardar el cambio. Intenta de nuevo."} /> : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 p-4 sm:p-5"><div className="relative min-w-[210px] flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar colonia o código postal…" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100" /></div><div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3"><select value={countryFilter} onChange={(event) => { setCountryFilter(event.target.value); setStateFilter(""); setCityFilter(""); }} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500"><option value="">Todos los países</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select><select value={stateFilter} disabled={!countryFilter} onChange={(event) => { setStateFilter(event.target.value); setCityFilter(""); }} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500 disabled:bg-zinc-50 disabled:text-ink-500"><option value="">Todos los estados</option>{filterStates.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select><select value={cityFilter} disabled={!stateFilter} onChange={(event) => setCityFilter(event.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500 disabled:bg-zinc-50 disabled:text-ink-500"><option value="">Todas las ciudades</option>{filterCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></div>{isFetching ? <Loader2 className="size-4 animate-spin text-brand-500" /> : null}</div>
        <div className="scrollbar-thin overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase tracking-wider text-ink-500"><tr><th className="px-6 py-3.5 font-semibold">Colonia</th><th className="px-6 py-3.5 font-semibold">Código postal</th><th className="px-6 py-3.5 font-semibold">Ciudad</th><th className="px-6 py-3.5 font-semibold">Estado</th><th className="px-6 py-3.5 font-semibold">País</th><th className="px-6 py-3.5" /></tr></thead><tbody className="divide-y divide-zinc-100">{visibleColonies.map((colony) => <tr key={colony.id} className="transition hover:bg-zinc-50/70"><td className="px-6 py-4"><p className="font-semibold text-ink-900">{colony.name}</p><p className="text-xs text-ink-500">ID: {colony.id}</p></td><td className="px-6 py-4 font-mono text-ink-700">{colony.postalCode}</td><td className="px-6 py-4 text-ink-700">{colony.cityName ?? colony.cityId}</td><td className="px-6 py-4 text-ink-700">{colony.stateName ?? colony.stateId}</td><td className="px-6 py-4 text-ink-700">{colony.countryName ?? colony.countryId}</td><td className="px-6 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => openEdit(colony)} aria-label={`Editar ${colony.name}`} className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600"><Edit3 className="size-4" /></button><button type="button" onClick={() => { if (window.confirm(`¿Eliminar la colonia ${colony.name}?`)) remove.mutate(colony.id); }} aria-label={`Eliminar ${colony.name}`} className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table></div>
        {visibleColonies.length === 0 ? <div className="px-6 py-16 text-center text-sm text-ink-500">No hay colonias que coincidan con los filtros seleccionados.</div> : null}
        <div className="border-t border-zinc-200 px-6 py-4 text-sm text-ink-500">Mostrando <strong className="font-semibold text-ink-700">{visibleColonies.length}</strong> registros</div>
      </section>

      {isCreating || editing ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-900/35 p-4" role="dialog" aria-modal="true"><div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5"><div><h2 className="text-lg font-semibold text-ink-900">{editing ? "Editar colonia" : "Nueva colonia"}</h2><p className="mt-1 text-sm text-ink-500">Completa la ubicación y los datos de la colonia.</p></div><button type="button" onClick={closeForm} className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-zinc-100"><X className="size-4" /></button></div><form onSubmit={save} className="space-y-5 p-6"><div className="grid gap-4 sm:grid-cols-2"><Select label="País" required value={form.countryId} onChange={(value) => setField("countryId", value)}><option value="">Selecciona un país</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</Select><Select label="Estado" required value={form.stateId} disabled={!form.countryId} onChange={(value) => setField("stateId", value)}><option value="">Selecciona un estado</option>{formStates.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</Select><Select label="Ciudad" required value={form.cityId} disabled={!form.stateId} onChange={(value) => setField("cityId", value)}><option value="">Selecciona una ciudad</option>{formCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</Select><label className="block space-y-2"><span className="text-sm font-medium text-ink-900">Código postal <span className="text-brand-500">*</span></span><input required inputMode="numeric" pattern="[0-9]{4,10}" maxLength={10} value={form.postalCode} onChange={(event) => setField("postalCode", event.target.value.replace(/\D/g, ""))} placeholder="Ej. 06700" className="w-full rounded-xl border border-zinc-300 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label></div><label className="block space-y-2"><span className="text-sm font-medium text-ink-900">Nombre de la colonia <span className="text-brand-500">*</span></span><input required value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Ej. Roma Norte" className="w-full rounded-xl border border-zinc-300 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><div className="flex justify-end gap-3 border-t border-zinc-100 pt-5"><button type="button" onClick={closeForm} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-zinc-100">Cancelar</button><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{isSaving && <Loader2 className="size-4 animate-spin" />}{editing ? "Guardar cambios" : "Crear colonia"}</button></div></form></div></div> : null}
    </div>
  );
}

function Select({ label, children, value, onChange, disabled = false, required = false }: { label: string; children: ReactNode; value: string; onChange: (value: string) => void; disabled?: boolean; required?: boolean }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-ink-900">{label} {required ? <span className="text-brand-500">*</span> : null}</span><select required={required} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-3 text-sm text-ink-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-zinc-50 disabled:text-ink-500">{children}</select></label>;
}

function Notice({ text, error = false }: { text: string; error?: boolean }) {
  return <div className={cn("flex items-start gap-2 rounded-xl border px-4 py-3 text-sm", error ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800")}><AlertCircle className="mt-0.5 size-4 shrink-0" />{text}</div>;
}
