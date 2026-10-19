import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import LodgingDetail from '@/pages/LodgingDetail'
import Search from '@/pages/Search'

// Layout compartido (admin puede seguir usando el suyo si ya lo tiene muy custom)
import AdminLayout from '@/layouts/AdminLayout'

// Admin pages
import Dashboard from '@/pages/admin/Dashboard'
import Reservations from '@/pages/admin/Reservations'
import LodgingList from '@/pages/admin/lodgings/LodgingList'
import LodgingTypes from '@/pages/admin/lodgings/LodgingTypes'
import Users from '@/pages/admin/Users'
import Settings from '@/pages/admin/Settings'
import Amenities from '@/pages/admin/settings/Amenities'
import Settlements from '@/pages/admin/settings/Settlements'
import Services from '@/pages/admin/settings/Services'
import AdminNotFound from '@/pages/admin/NotFound'
import { useLocation } from 'react-router-dom'

// Host
import HostDashboard from '@/pages/host/Dashboard'
import HostLodgings from '@/pages/host/Lodgings'
// ...

// Guest
import GuestDashboard from '@/pages/guest/Dashboard'

// Support
import SupportDashboard from '@/pages/support/Dashboard'

export default function App() {

  const location = useLocation()
  console.log('📍 Ruta:', location.pathname)
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/buscar" element={<Search />} />
      <Route path="/alojamiento/:slug" element={<LodgingDetail />} />
      <Route path="/login" element={<Login />} />

      {/* ============ ADMIN ============ */}
      <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="reservations" element={<Reservations />} />
    <Route path="lodgings" element={<LodgingList />} />
    <Route path="lodging-types" element={<LodgingTypes />} />
    <Route path="users" element={<Users />} />
    <Route path="settings" element={<Settings />} />
    <Route path="settings/amenities" element={<Amenities />} />
    <Route path="settings/settlements" element={<Settlements />} />
    <Route path="settings/services" element={<Services />} />
    <Route path="*" element={<AdminNotFound />} />
  </Route>
</Route>

      {/* ============ HOST ============ */}
      <Route element={<ProtectedRoute allowedRoles={['host']} />}>
        <Route path="/host" element={<AdminLayout />}>
          <Route index element={<Navigate to="/host/dashboard" replace />} />
          <Route path="dashboard" element={<HostDashboard />} />
          <Route path="lodgings" element={<HostLodgings />} />
          {/* etc */}
        </Route>
      </Route>

      {/* ============ GUEST ============ */}
      <Route element={<ProtectedRoute allowedRoles={['guest']} />}>
        <Route path="/guest" element={<AdminLayout />}>
          <Route index element={<Navigate to="/guest/dashboard" replace />} />
          <Route path="dashboard" element={<GuestDashboard />} />
        </Route>
      </Route>

      {/* ============ SUPPORT ============ */}
      <Route element={<ProtectedRoute allowedRoles={['support']} />}>
        <Route path="/support" element={<AdminLayout />}>
          <Route index element={<Navigate to="/support/dashboard" replace />} />
          <Route path="dashboard" element={<SupportDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}