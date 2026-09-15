"use client";

/* La foto llega como URL firmada o preview local de un archivo seleccionado. */
/* eslint-disable @next/next/no-img-element */

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  Loader2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { api, ApiError } from "@/lib/api-client";
import { updateStoredUser } from "@/lib/auth/client-session";
import { useCurrentUser } from "@/lib/hooks/use-auth";
import { queryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import type { User } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function ProfileView() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{ name: string; phone: string } | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const name = draft?.name ?? user?.name ?? "";
  const phone = draft?.phone ?? user?.phone ?? "";
  const setName = (value: string) => setDraft((current) => ({ name: value, phone: current?.phone ?? phone }));
  const setPhone = (value: string) => setDraft((current) => ({ name: current?.name ?? name, phone: value }));

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (avatar) {
        const body = new FormData();
        body.append("name", name.trim());
        body.append("phone", phone.trim());
        body.append("avatar", avatar);
        return api.patch<User | { user: User }>(routes.api.profile, body);
      }
      return api.patch<User | { user: User }>(routes.api.profile, {
        name: name.trim(),
        phone: phone.trim(),
      });
    },
    onSuccess: (payload) => {
      const updatedUser = "user" in payload ? payload.user : payload;
      queryClient.setQueryData(queryKeys.auth.me, updatedUser);
      updateStoredUser(updatedUser);
      setAvatar(null);
    },
  });

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile.mutate();
  };

  if (!user) {
    return <div className="h-80 animate-pulse rounded-2xl bg-zinc-100" />;
  }

  const error = updateProfile.error;
  const avatarUrl = preview ?? user.avatarUrl ?? null;
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-ink-500">Mantén actualizados tus datos personales y tu foto.</p>
      </div>

      {error ? <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error instanceof ApiError ? error.message : "No se pudo actualizar tu perfil."}</div> : null}
      {updateProfile.isSuccess ? <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><Check className="size-4" />Tus datos se actualizaron correctamente.</div> : null}

      <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-5"><h2 className="font-semibold text-ink-900">Información personal</h2><p className="mt-1 text-sm text-ink-500">Estos datos se muestran en tu cuenta de Hospeda.</p></div>
        <div className="space-y-8 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="relative"><div className="grid size-24 place-items-center overflow-hidden rounded-full bg-brand-100 text-2xl font-semibold text-brand-600 ring-4 ring-brand-50">{avatarUrl ? <img src={avatarUrl} alt={`Foto de ${name}`} className="size-full object-cover" /> : getInitials(name)}</div><label htmlFor="avatar" className="absolute bottom-0 right-0 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-white bg-brand-500 text-white shadow-md transition hover:bg-brand-600"><Camera className="size-4" /><span className="sr-only">Cambiar foto</span></label><input id="avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} className="sr-only" /></div><div><p className="text-sm font-semibold text-ink-900">Foto de perfil</p><p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">JPG, PNG o WebP. Recomendamos una imagen cuadrada de al menos 256 × 256 px.</p>{avatar ? <p className="mt-2 text-xs font-medium text-brand-600">{avatar.name} seleccionado</p> : null}</div></div>
          <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium text-ink-900">Nombre completo</span><div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" /><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-zinc-300 py-3 pl-10 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div></label><label className="space-y-2"><span className="text-sm font-medium text-ink-900">Teléfono</span><div className="relative"><Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" /><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+52 55 1234 5678" className="w-full rounded-xl border border-zinc-300 py-3 pl-10 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div></label><label className="space-y-2 sm:col-span-2"><span className="text-sm font-medium text-ink-900">Correo electrónico</span><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" /><input value={user.email} readOnly className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3.5 text-sm text-ink-500 outline-none" /></div><span className="block text-xs text-ink-500">El correo se administra desde el servicio de identidad.</span></label></div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/50 px-6 py-4 sm:px-8"><button type="submit" disabled={updateProfile.isPending || !name.trim()} className={cn("inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600", (updateProfile.isPending || !name.trim()) && "cursor-not-allowed opacity-60")}>{updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Guardar cambios</button></div>
      </form>
    </div>
  );
}
