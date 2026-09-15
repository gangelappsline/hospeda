/** Mapa único de rutas de Hospeda, para no escribir strings sueltos. */

export const routes = {
  home: "/",
  login: "/login",
  admin: {
    root: "/admin",
    bookings: "/admin/reservaciones",
    properties: "/admin/propiedades",
    users: "/admin/usuarios",
    settings: "/admin/configuracion",
  },
  api: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
} as const;

/** Rutas que exigen sesión activa; las valida `proxy.ts`. */
export const PROTECTED_PREFIXES = ["/admin"] as const;

/** Rutas a las que no debe entrar alguien con sesión ya iniciada. */
export const AUTH_ROUTES = ["/login"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}
