import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import LodgingDetail from '@/pages/LodgingDetail'
import Search from '@/pages/Search'
import ExperiencesExplore from '@/pages/ExperiencesExplore'
import ServicesExplore from '@/pages/ServicesExplore'

// Afiliados (público)
import AffiliatesLanding from '@/pages/affiliates/AffiliatesLanding'
import AffiliateRegister from '@/pages/affiliates/AffiliateRegister'

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
import ExperienceList from '@/pages/admin/experiences/ExperienceList'
import ExperienceCategories from '@/pages/admin/experiences/ExperienceCategories'
import ServiceList from '@/pages/admin/services/ServiceList'
import ServiceCategories from '@/pages/admin/services/ServiceCategories'
import AffiliateList from '@/pages/admin/affiliates/AffiliateList'
import AffiliateSettingsPage from '@/pages/admin/affiliates/AffiliateSettingsPage'
import AdminNotFound from '@/pages/admin/NotFound'
import { useLocation } from 'react-router-dom'

// Host
import HostDashboard from '@/pages/host/Dashboard'
import HostLodgings from '@/pages/host/Lodgings'
import LodgingForm from '@/pages/host/LodgingForm'
// ...

// Guest
import GuestDashboard from '@/pages/guest/Dashboard'

// Support
import SupportDashboard from '@/pages/support/Dashboard'

// Affiliate panel
import AffiliateDashboard from '@/pages/affiliate/Dashboard'
import AffiliateReferrals from '@/pages/affiliate/Referrals'
import AffiliateCommissions from '@/pages/affiliate/Commissions'
import AffiliatePayouts from '@/pages/affiliate/Payouts'
import AffiliateProfile from '@/pages/affiliate/Profile'

export default function App() {

  const location = useLocation()
  console.log('📍 Ruta:', location.pathname)
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/alojamientos" element={<Search />} />
      <Route path="/experiencias" element={<ExperiencesExplore />} />
      <Route path="/servicios" element={<ServicesExplore />} />
      <Route path="/buscar" element={<Search />} />
      <Route path="/alojamiento/:slug" element={<LodgingDetail />} />
      <Route path="/login" element={<Login />} />

      {/* Programa de afiliados (público) */}
      <Route path="/afiliados" element={<AffiliatesLanding />} />
      <Route path="/afiliados/registro" element={<AffiliateRegister />} />

      {/* ============ ADMIN ============ */}
      <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="reservations" element={<Reservations />} />
    <Route path="lodgings" element={<LodgingList />} />
    <Route path="lodgings/new" element={<LodgingForm />} />
    <Route path="lodgings/:id/edit" element={<LodgingForm />} />
    <Route path="lodgings/:id/instructions" element={<LodgingForm initialStep={6} />} />
    <Route path="lodging-types" element={<LodgingTypes />} />
    <Route path="experiences" element={<ExperienceList />} />
    <Route path="experience-categories" element={<ExperienceCategories />} />
    <Route path="services" element={<ServiceList />} />
    <Route path="service-categories" element={<ServiceCategories />} />
    <Route path="users" element={<Users />} />
    <Route path="affiliates" element={<AffiliateList />} />
    <Route path="affiliates/settings" element={<AffiliateSettingsPage />} />
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
          <Route path="lodgings/new" element={<LodgingForm />} />
          <Route path="lodgings/:id/edit" element={<LodgingForm />} />
          <Route path="lodgings/:id/instructions" element={<LodgingForm initialStep={6} />} />
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

      {/* ============ AFILIADO ============ */}
      <Route element={<ProtectedRoute allowedRoles={['affiliate']} />}>
        <Route path="/affiliate" element={<AdminLayout />}>
          <Route index element={<Navigate to="/affiliate/dashboard" replace />} />
          <Route path="dashboard" element={<AffiliateDashboard />} />
          <Route path="referrals" element={<AffiliateReferrals />} />
          <Route path="commissions" element={<AffiliateCommissions />} />
          <Route path="payouts" element={<AffiliatePayouts />} />
          <Route path="profile" element={<AffiliateProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}