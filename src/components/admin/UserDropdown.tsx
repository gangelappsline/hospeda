import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { getUser, clearAuth } from '@/utils/authStorage'
import type { ProfileUser } from '@/types/profile'
import ProfileModal from './profile/ProfileModal'
import { Role } from '@/types/auth'


function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UserDropdown() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const user = getUser<ProfileUser>()
  const displayName = user?.name || 'Usuario'
  const initials = getInitials(displayName)

  const DEFAULT_ROLE_LABELS: Record<Role, string> = {
  'host': 'Anfitrión',
  'administrator': 'Administrador',
  'support': 'Soporte',
  'guest': 'Invitado',
  'affiliate': 'Afiliado',
}

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearAuth()
    toast.success('Sesión cerrada', {
      description: 'Has salido del sistema correctamente.',
    })
    navigate('/login')
  }

  const handleOpenProfile = () => {
    setIsOpen(false)
    setIsProfileOpen(true)
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-cool-steel-50 transition-colors"
        >
          {/* Avatar */}
          {user?.photo ? (
            <img
              src={user.photo}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-vivid-tangerine-500 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
          )}

          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-cool-steel-900 leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-cool-steel-500 leading-tight">{user?.role ? DEFAULT_ROLE_LABELS[user.role as Role] : ''}</p>
          </div>

          <ChevronDown
            size={16}
            className={`text-cool-steel-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-cool-steel-200 py-1.5 z-50">
            {/* Info del usuario */}
            <div className="px-4 py-3 border-b border-cool-steel-100">
              <p className="text-sm font-semibold text-cool-steel-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-cool-steel-500 truncate">
                {user?.email || 'usuario@hospeda.com'}
              </p>
            </div>

            {/* Opciones */}
            <div className="py-1">
              <button
                onClick={handleOpenProfile}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
              >
                <User size={16} className="text-cool-steel-400" />
                Ver perfil
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/admin/settings')
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
              >
                <Settings size={16} className="text-cool-steel-400" />
                Configuración
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-cool-steel-100 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-vivid-tangerine-600 hover:bg-vivid-tangerine-50 transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de perfil */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  )
}