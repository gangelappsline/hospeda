"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Edit3,
  Loader2,
  Plus,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { usePropertyTypes } from "@/lib/hooks/use-properties";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PropertyTypesView() {
  const { data: types = [], isFetching, isError, create, update, remove } = usePropertyTypes();
  const [editing, setEditing] = useState<PropertyType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const closeForm = () => {
    setEditing(null);
    setIsCreating(false);
    setName("");
    setDescription("");
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setIsCreating(true);
  };

  const openEdit = (type: PropertyType) => {
    setEditing(type);
    setName(type.name);
    setDescription(type.description ?? "");
    setIsCreating(false);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = { name: name.trim(), description: description.trim() };
    if (!body.name) return;
    if (editing) {
      update.mutate({ id: editing.id, ...body }, { onSuccess: closeForm });
    } else {
      create.mutate(body, { onSuccess: closeForm });
    }
  };

  const mutationError = create.error ?? update.error ?? remove.error;
  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500"><span>Alojamientos</span><span>/</span><span className="text-ink-700">Tipos</span></div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">Tipos de alojamiento</h1>
          <p className="mt-1 text-sm text-ink-500">Organiza el catálogo y define cómo se clasifican tus alojamientos.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"><Plus className="size-4" />Nuevo tipo</button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50/70 px-5 py-4">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-brand-500 shadow-sm"><Tags className="size-5" /></span><div><p className="text-sm font-semibold text-ink-900">Catálogo de tipos</p><p className="text-xs text-ink-500">{types.length} tipos configurados para tus alojamientos</p></div></div>
        {isFetching ? <Loader2 className="size-4 animate-spin text-brand-500" /> : <span className="text-sm font-semibold text-brand-600">Activo</span>}
      </div>

      {isError ? <Notice text="No se pudo sincronizar el catálogo. Mostrando los datos disponibles mientras se restablece la conexión." /> : null}
      {mutationError ? <Notice text={mutationError instanceof ApiError ? mutationError.message : "No se pudo guardar el cambio. Intenta de nuevo."} error /> : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-ink-500"><tr><th className="px-6 py-3.5 font-semibold">Tipo</th><th className="px-6 py-3.5 font-semibold">Descripción</th><th className="px-6 py-3.5 font-semibold">Alojamientos</th><th className="px-6 py-3.5 font-semibold">Estado</th><th className="px-6 py-3.5" /></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {types.map((type) => <tr key={type.id} className="transition hover:bg-zinc-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-500"><Building2 className="size-4" /></span><div><p className="font-semibold text-ink-900">{type.name}</p><p className="text-xs text-ink-500">ID: {type.id}</p></div></div></td><td className="max-w-sm px-6 py-4 text-ink-500">{type.description || "Sin descripción"}</td><td className="px-6 py-4 font-semibold text-ink-900">{(type.propertyCount ?? 0).toLocaleString("es-MX")}</td><td className="px-6 py-4"><span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", type.active === false ? "bg-zinc-100 text-ink-500" : "bg-emerald-50 text-emerald-700")}><span className={cn("size-1.5 rounded-full", type.active === false ? "bg-zinc-400" : "bg-emerald-500")} />{type.active === false ? "Inactivo" : "Activo"}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => openEdit(type)} aria-label={`Editar ${type.name}`} className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"><Edit3 className="size-4" /></button><button type="button" onClick={() => { if (window.confirm(`¿Eliminar el tipo ${type.name}?`)) remove.mutate(type.id); }} aria-label={`Eliminar ${type.name}`} className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button></div></td></tr>)}
            </tbody>
          </table>
        </div>
        {types.length === 0 ? <div className="px-6 py-16 text-center text-sm text-ink-500">Todavía no hay tipos de alojamiento configurados.</div> : null}
      </section>

      {isCreating || editing ? <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/35 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5"><div><h2 className="text-lg font-semibold text-ink-900">{editing ? "Editar tipo" : "Nuevo tipo de alojamiento"}</h2><p className="mt-1 text-sm text-ink-500">La información se reflejará en el catálogo.</p></div><button type="button" onClick={closeForm} className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-zinc-100"><X className="size-4" /></button></div><form onSubmit={save} className="space-y-5 p-6"><label className="block space-y-2"><span className="text-sm font-medium text-ink-900">Nombre <span className="text-brand-500">*</span></span><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Villa" className="w-full rounded-xl border border-zinc-300 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><label className="block space-y-2"><span className="text-sm font-medium text-ink-900">Descripción <span className="text-xs font-normal text-ink-500">(opcional)</span></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Describe brevemente este tipo de alojamiento…" className="w-full resize-none rounded-xl border border-zinc-300 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><div className="flex justify-end gap-3 border-t border-zinc-100 pt-5"><button type="button" onClick={closeForm} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-zinc-100">Cancelar</button><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{editing ? "Guardar cambios" : "Crear tipo"}</button></div></form></div></div> : null}
    </div>
  );
}

function Notice({ text, error = false }: { text: string; error?: boolean }) {
  return <div className={cn("flex items-start gap-2 rounded-xl border px-4 py-3 text-sm", error ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800")}><AlertCircle className="mt-0.5 size-4 shrink-0" />{text}</div>;
}
