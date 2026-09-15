import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/lib/routes";

/**
 * Protección de navegación ligera. La sesión real vive en el backend externo
 * y sus endpoints validan el Bearer token; esta cookie no contiene secretos y
 * solo evita mostrar pantallas equivocadas durante la navegación.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasClientSession = Boolean(request.cookies.get("hospeda_session")?.value);

  if (pathname === routes.login && hasClientSession) {
    return NextResponse.redirect(new URL(routes.admin.root, request.url));
  }

  if (
    (pathname === routes.admin.root || pathname.startsWith(`${routes.admin.root}/`)) &&
    !hasClientSession
  ) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
