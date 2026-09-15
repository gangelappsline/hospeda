"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Edit3,
  Loader2,
  Plus,
  Tags,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { useLodgingTypes } from "@/lib/hooks/use-lodging-types";
import type { LodgingType } from "@/lib/types";
import { cn } from "@/lib/utils";

/** El icono del tipo de alojamiento solo admite imágenes WebP. */
function isWebpFile(file: File) {
  return file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
}

const WEBP_ERROR = "El icono debe ser una imagen en formato WebP (.webp).";

export function LodgingTypesView() {
  const {
    data: types = [],
    isFetching,
    isError,
    create,
    update,
    remove,
  } = useLodgingTypes();

  const [editing, setEditing] = useState<LodgingType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconError, setIconError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
    };
  }, [iconPreview]);

  const resetForm = () => {
    setEditing(null);
    setIsCreating(false);
    setName("");
    setDescription("");
    setIcon(null);
    setIconPreview(null);
    setIconError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEdit = (type: LodgingType) => {
    resetForm();
    setEditing(type);
    setName(type.name);
    setDescription(type.description ?? "");
  };

  const onIconChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!isWebpFile(file)) {
      setIcon(null);
      setIconPreview(null);
      setIconError(WEBP_ERROR);
      event.target.value = "";
      return;
    }
    setIconError(null);
    setIcon(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (icon && !isWebpFile(icon)) {
      setIconError(WEBP_ERROR);
      return;
    }
    if (!editing && !icon) {
      setIconError("Selecciona un icono WebP para el tipo de alojamiento.");
      return;
    }

    const body = new FormData();
    body.set("name", trimmedName);
    body.set("description", description.trim());
    if (icon) body.set("icon", icon);

    if (editing) {
      update.mutate({ id: editing.id, body }, { onSuccess: resetForm });
    } else {
      create.mutate(body, { onSuccess: resetForm });
    }
  };

  const mutationError = create.error ?? update.error ?? remove.error;
  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <span>Alojamientos</span>
            <span>/</span>
            <span className="text-ink-700">Tipos</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
            Tipos de alojamiento
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Organiza el catálogo y define cómo se clasifican tus alojamientos.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          <Plus className="size-4" />
          Nuevo tipo
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-500 shadow-sm">
            <Tags className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Catálogo de tipos</p>
            <p className="text-xs text-ink-500">
              {types.length} tipos configurados para tus alojamientos
            </p>
          </div>
        </div>
        {isFetching ? (
          <Loader2 className="size-4 animate-spin text-brand-500" />
        ) : (
          <span className="text-sm font-semibold text-brand-600">Activo</span>
        )}
      </div>

      {isError ? (
        <Notice text="No se pudo sincronizar el catálogo. Mostrando los datos disponibles mientras se restablece la conexión." />
      ) : null}
      {mutationError ? (
        <Notice
          error
          text={
            mutationError instanceof ApiError
              ? mutationError.message
              : "No se pudo guardar el cambio. Intenta de nuevo."
          }
        />
      ) : null}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {types.map((type) => (
          <article
            key={type.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/60"
          >
            <div className="relative grid aspect-[16/9] place-items-center bg-gradient-to-br from-brand-50 via-white to-brand-100/60">
              {type.icon_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={type.icon_url}
                    alt={`Icono de ${type.name}`}
                    loading="lazy"
                    className="size-20 object-contain drop-shadow-sm transition duration-300 group-hover:scale-105"
                  />
                </>
              ) : (
                <span className="grid size-20 place-items-center rounded-2xl bg-white/80 text-brand-300 shadow-sm">
                  <Building2 className="size-9" />
                </span>
              )}

              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-500 shadow-sm">
                ID {type.id}
              </span>
              <div className="absolute right-4 top-4 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(type)}
                  aria-label={`Editar ${type.name}`}
                  className="grid size-9 place-items-center rounded-full bg-white/90 text-ink-500 shadow-sm transition hover:text-brand-600"
                >
                  <Edit3 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el tipo ${type.name}?`))
                      remove.mutate(type.id);
                  }}
                  aria-label={`Eliminar ${type.name}`}
                  className="grid size-9 place-items-center rounded-full bg-white/90 text-ink-500 shadow-sm transition hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-5">
              <h3 className="text-base font-semibold text-ink-900">{type.name}</h3>
              <p className="line-clamp-3 text-sm leading-relaxed text-ink-500">
                {type.description || "Sin descripción"}
              </p>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={openCreate}
          className="grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-zinc-200 p-6 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
        >
          <span className="flex flex-col items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-500">
              <Plus className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">
                Agregar tipo de alojamiento
              </span>
              <span className="mt-1 block text-xs text-ink-500">
                Define nombre, descripción e icono WebP.
              </span>
            </span>
          </span>
        </button>
      </section>

      {types.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-ink-500">
          Todavía no hay tipos de alojamiento configurados.
        </div>
      ) : null}

      {isCreating || editing ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/35 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">
                  {editing ? "Editar tipo" : "Nuevo tipo de alojamiento"}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  La información se reflejará en el catálogo.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-zinc-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-5 p-6">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink-900">
                  Nombre <span className="text-brand-500">*</span>
                </span>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Villa"
                  className="w-full rounded-xl border border-zinc-300 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink-900">
                  Descripción{" "}
                  <span className="text-xs font-normal text-ink-500">(opcional)</span>
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Describe brevemente este tipo de alojamiento…"
                  className="w-full resize-none rounded-xl border border-zinc-300 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-ink-900">
                  Icono{" "}
                  {editing ? (
                    <span className="text-xs font-normal text-ink-500">
                      (opcional, reemplaza el actual)
                    </span>
                  ) : (
                    <span className="text-brand-500">*</span>
                  )}
                </span>

                <label
                  htmlFor="lodging-type-icon"
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 transition",
                    iconError
                      ? "border-red-300 bg-red-50/40 hover:border-red-400"
                      : "border-zinc-300 hover:border-brand-400 hover:bg-brand-50/40",
                  )}
                >
                  <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-brand-400 shadow-sm ring-1 ring-zinc-100">
                    {iconPreview ?? editing?.icon_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={iconPreview ?? editing?.icon_url ?? ""}
                          alt="Vista previa del icono"
                          className="size-10 object-contain"
                        />
                      </>
                    ) : (
                      <Upload className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-900">
                      {icon ? icon.name : "Haz clic para seleccionar el icono"}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      Solo imágenes WebP (.webp). Se recomienda un archivo cuadrado.
                    </span>
                  </span>
                </label>
                <input
                  id="lodging-type-icon"
                  ref={fileInputRef}
                  type="file"
                  accept="image/webp,.webp"
                  onChange={onIconChange}
                  className="sr-only"
                />
                {iconError ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {iconError}
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {editing ? "Guardar cambios" : "Crear tipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Notice({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {text}
    </div>
  );
}
