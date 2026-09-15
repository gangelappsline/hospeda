import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_API_URL = "http://localhost:8000/api";

// Estos encabezados pertenecen a la conexión entre el navegador y Next, no a
// la conexión nueva que el servidor abre hacia la API.
const REQUEST_HEADERS_TO_REMOVE = [
  "connection",
  "content-length",
  "host",
  "origin",
  "transfer-encoding",
] as const;

const RESPONSE_HEADERS_TO_REMOVE = [
  "connection",
  "content-encoding",
  "content-length",
  "transfer-encoding",
] as const;

function configuredApiUrl() {
  // NEXT_PUBLIC_API_URL se conserva solo para despliegues aún no migrados. Las
  // nuevas configuraciones deben usar API_URL, que nunca llega al navegador.
  return (
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    DEFAULT_API_URL
  );
}

function getBackendUrl(request: NextRequest, path: string[]) {
  try {
    const backendUrl = new URL(configuredApiUrl());
    if (backendUrl.protocol !== "http:" && backendUrl.protocol !== "https:") {
      return undefined;
    }

    const basePath = backendUrl.pathname.replace(/\/+$/, "");
    const targetPath = path.map(encodeURIComponent).join("/");
    backendUrl.pathname = `${basePath}/${targetPath}`;
    backendUrl.search = request.nextUrl.search;
    backendUrl.hash = "";

    return backendUrl;
  } catch {
    return undefined;
  }
}

function removeConnectionHeaders(headers: Headers, names: readonly string[]) {
  // RFC 9110 permite que Connection nombre encabezados adicionales que tampoco
  // deben pasar al siguiente salto.
  const connectionHeaders = headers
    .get("connection")
    ?.split(",")
    .map((header) => header.trim())
    .filter(Boolean);

  names.forEach((header) => headers.delete(header));
  connectionHeaders?.forEach((header) => headers.delete(header));
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers(response.headers);
  removeConnectionHeaders(headers, RESPONSE_HEADERS_TO_REMOVE);

  // Headers conserva el acceso a Set-Cookie en el runtime de Node, pero al
  // clonar puede agrupar varias cookies. Se agregan individualmente para no
  // perder ninguna cookie emitida por el backend.
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    headers.delete("set-cookie");
    setCookies.forEach((cookie) => headers.append("set-cookie", cookie));
  }

  return headers;
}

async function forward(request: NextRequest, context: RouteContext<"/api/[...path]">) {
  const { path } = await context.params;
  const backendUrl = getBackendUrl(request, path);

  if (!backendUrl) {
    console.error("API_URL no contiene una URL HTTP(S) válida.");
    return NextResponse.json(
      { message: "La conexión con el servidor de Hospeda no está configurada." },
      { status: 500 },
    );
  }

  const headers = new Headers(request.headers);
  // Al no reenviar Origin, la API trata esta llamada como server-to-server. La
  // llamada del navegador sí es same-origin: /api en el dominio del frontend.
  removeConnectionHeaders(headers, REQUEST_HEADERS_TO_REMOVE);

  let response: Response;
  try {
    response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    console.error("No fue posible conectar con la API de Hospeda", error);
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor de Hospeda." },
      { status: 502 },
    );
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: copyResponseHeaders(response),
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const OPTIONS = forward;
export const HEAD = forward;
