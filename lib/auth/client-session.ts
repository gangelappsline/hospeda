"use client";

import type { User } from "@/lib/types";

const TOKEN_KEY = "hospeda_api_token";
const USER_KEY = "hospeda_api_user";
const SESSION_COOKIE = "hospeda_session";

/**
 * La sesión del panel pertenece al backend externo. El token se conserva en el
 * navegador únicamente para enviarlo como Bearer al proxy same-origin `/api`;
 * Next.js lo reenvía al backend sin exponer su URL ni requerir CORS.
 */
export function saveClientSession(
  token: string,
  user: User,
  expiresAt?: string,
  remember = true,
) {
  if (typeof window === "undefined") return;

  const storage = remember ? window.localStorage : window.sessionStorage;
  const otherStorage = remember ? window.sessionStorage : window.localStorage;
  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));

  const maxAge = expiresAt
    ? Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : 60 * 60 * 24 * 7;
  document.cookie = `${SESSION_COOKIE}=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(TOKEN_KEY) ??
    window.sessionStorage.getItem(TOKEN_KEY)
  );
}

export function getStoredUser(): User | undefined {
  if (typeof window === "undefined") return undefined;
  const raw =
    window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return undefined;
  }
}

export function updateStoredUser(user: User) {
  if (typeof window === "undefined") return;
  const storage = window.localStorage.getItem(TOKEN_KEY)
    ? window.localStorage
    : window.sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearClientSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
