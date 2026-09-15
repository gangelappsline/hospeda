"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { useLogin } from "@/lib/hooks/use-auth";
import { routes } from "@/lib/routes";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const login = useLogin(redirectTo || routes.admin.root);

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? "Ocurrió un error inesperado. Intenta de nuevo."
        : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password, remember });
  }

  // `isSuccess` se mantiene porque la redirección tarda un instante.
  const isBusy = login.isPending || login.isSuccess;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-ink-900">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            disabled={isBusy}
            className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-ink-900">
            Contraseña
          </label>
          <button
            type="button"
            className="text-xs font-medium text-brand-500 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={isBusy}
            className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-11 pr-12 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-500 transition hover:bg-zinc-100 hover:text-ink-900"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="size-4 rounded border-zinc-300 text-brand-500 accent-brand-500"
        />
        Mantener sesión iniciada
      </label>

      <button
        type="submit"
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isBusy ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verificando…
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </form>
  );
}
