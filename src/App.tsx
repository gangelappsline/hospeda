import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import AdminLayout from '@/layouts/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import Reservations from '@/pages/admin/Reservations'
import LodgingList from '@/pages/admin/lodgings/LodgingList'
import LodgingTypes from '@/pages/admin/lodgings/LodgingTypes'
import Users from '@/pages/admin/Users'
import Settings from '@/pages/admin/Settings'
import Amenities from '@/pages/admin/settings/Amenities'
import Settlements from '@/pages/admin/settings/Settlements'
import AdminNotFound from '@/pages/admin/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas con AdminLayout */}
        <Route element={<ProtectedRoute />}>
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
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}