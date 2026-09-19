import LandingNavbar from '@/components/landing/LandingNavbar'
import Hero from '@/components/landing/Hero'
import FeaturedStays from '@/components/landing/FeaturedStays'
import Features from '@/components/landing/Features'
import HostCTA from '@/components/landing/HostCTA'
import { Home as HomeIcon } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      <main>
        <Hero />
        <FeaturedStays />
        <Features />
        <HostCTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <HomeIcon size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">Hospeda</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 Hospeda. Hecho en México.
          </p>
        </div>
      </footer>
    </div>
  )
}