import { getAuth } from '@/utils/authStorage'

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken } = getAuth()

  const headers = new Headers(options.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    // Token inválido/expirado: limpiar y mandar al login
    // (opcional, o manejarlo globalmente con un interceptor)
  }

  return res
}