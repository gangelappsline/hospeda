import "server-only";

import type { User } from "@/lib/types";

/**
 * Tokens de sesión firmados con HMAC-SHA256 usando Web Crypto.
 *
 * Se usa Web Crypto (no `node:crypto`) porque `proxy.ts` puede ejecutarse en el
 * runtime Edge, donde los módulos de Node no están disponibles.
 *
 * Formato: base64url(payload).base64url(firma)  — mismo espíritu que un JWT.
 */

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: User["role"];
  /** Emitido en (epoch segundos). */
  iat: number;
  /** Expira en (epoch segundos). */
  exp: number;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(
  payload: Omit<TokenPayload, "iat" | "exp">,
  secret: string,
  maxAgeSeconds: number,
): Promise<{ token: string; expiresAt: string }> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const full: TokenPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + maxAgeSeconds,
  };

  const body = toBase64Url(encoder.encode(JSON.stringify(full)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey(secret),
    encoder.encode(body),
  );

  return {
    token: `${body}.${toBase64Url(new Uint8Array(signature))}`,
    expiresAt: new Date(full.exp * 1000).toISOString(),
  };
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<TokenPayload | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await getKey(secret),
      fromBase64Url(signature),
      encoder.encode(body),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as TokenPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
