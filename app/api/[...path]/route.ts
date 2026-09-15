import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "origin",
  "transfer-encoding",
] as const;

function getBackendUrl(request: NextRequest, path: string[]) {
  const configuredUrl =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api";
  const baseUrl = configuredUrl.replace(/\/$/, "");
  const pathname = path.map(encodeURIComponent).join("/");
  return `${baseUrl}/${pathname}${request.nextUrl.search}`;
}

async function forward(request: NextRequest, context: RouteContext<"/api/[...path]">) {
  const { path } = await context.params;
  const headers = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));

  let response: Response;
  try {
    response = await fetch(getBackendUrl(request, path), {
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

  const responseHeaders = new Headers(response.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const OPTIONS = forward;
export const HEAD = forward;
