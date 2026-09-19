import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'
import { getToken, clearAuth } from '@/utils/authStorage'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor de solicitudes: usar getToken() en lugar de localStorage directo
apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status
    const data = error.response?.data

    // Sin respuesta del servidor
    if (!error.response) {
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Verifique su conexión.',
        status: 0,
      } as ApiError)
    }

    // 401: sesión expirada
    // Evitar redirigir si ya estamos en /login para no crear bucles
    if (status === 401 && !window.location.pathname.includes('/login')) {
      clearAuth()
      // Guardar la ruta actual para volver después del login (opcional)
      const redirect = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?redirect=${redirect}`
      return Promise.reject({
        message: 'Sesión expirada. Inicie sesión nuevamente.',
        status: 401,
      } as ApiError)
    }

    const apiError: ApiError = {
      message:
        data?.message ||
        (status === 401
          ? 'Credenciales incorrectas.'
          : status === 403
            ? 'No tiene permisos para realizar esta acción.'
            : status === 422
              ? 'Los datos enviados no son válidos.'
              : status === 500
                ? 'Error interno del servidor.'
                : 'Ocurrió un error inesperado.'),
      errors: data?.errors,
      status,
    }

    return Promise.reject(apiError)
  }
)

export default apiClient