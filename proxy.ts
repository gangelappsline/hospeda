import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/env";
import { isAuthPath, isProtectedPath, routes } from "@/lib/routes";

/**
 * Proxy de Next.js 16 (antes se llamaba `middleware.ts`).
 *
 * Hace una comprobación *optimista*: solo mira si la cookie de sesión existe
 * para redirigir rápido, sin verificar la firma (eso es caro y aquí corre en
 * cada request). La verificación real del token ocurre en el layout de /admin
 * y en las rutas de API, que es donde de verdad se protege el acceso.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  // Sin sesión en una ruta protegida -> al login, recordando a dónde iba.
  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión en /login -> directo al panel.
  if (isAuthPath(pathname) && hasSession) {
    return NextResponse.redirect(new URL(routes.admin.root, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye assets estáticos para no bloquear CSS/JS/imágenes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
