/** Mapa único de rutas de Hospeda, para no escribir strings sueltos. */

export const routes = {
  home: "/",
  login: "/login",
  admin: {
    root: "/admin",
    bookings: "/admin/reservaciones",
    properties: "/admin/propiedades",
    propertyTypes: "/admin/propiedades/tipos",
    users: "/admin/usuarios",
    settings: "/admin/configuracion",
    colonies: "/admin/configuracion/colonias",
    profile: "/admin/perfil",
  },
  /** Rutas del backend externo. El cliente HTTP las antepone a API_URL. */
  api: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    dashboard: "/dashboard",
    properties: "/properties",
    propertyTypes: "/property-types",
    colonies: "/colonies",
    countries: "/locations/countries",
    states: "/locations/states",
    cities: "/locations/cities",
    profile: "/users/me",
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
