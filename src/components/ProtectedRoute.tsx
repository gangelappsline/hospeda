import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuth } from '@/utils/authStorage'
import { getDefaultPanel } from '@/config/panels'
import type { Role } from '@/types/auth'

interface Props {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const location = useLocation()
  const { accessToken: token, user } = getAuth()

  // 1. No autenticado → al login, guardando el destino
  if (!token || !user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  // 2. Autenticado pero sin el rol requerido → a su panel por defecto
  if (allowedRoles && !allowedRoles.some((r) => user.role === r)) {
    return <Navigate to={getDefaultPanel(user.role)} replace />
  }

  return <Outlet />
}