import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  Heart,
  MessageSquare,
  User,
  Ticket,
  Scale,
  Users,
  Settings,
  Home,
} from 'lucide-react'
import type { Role } from '@/types/auth'

export interface PanelChild {
  label: string
  to: string
}

export interface PanelSection {
  label: string
  icon: LucideIcon
  to?: string             // presente si NO tiene submenú
  children?: PanelChild[] // presente si SÍ tiene submenú
}

export interface PanelConfig {
  role: Role
  basePath: string
  label: string
  /** Nombre de color Tailwind: 'orange' | 'rose' | 'sky' | 'violet' */
  accent: 'orange' | 'rose' | 'sky' | 'violet'
  sections: PanelSection[]
}

export const PANELS: Record<Role, PanelConfig> = {
  administrator: {
    role: 'administrator',
    basePath: '/admin',
    label: 'Administración',
    accent: 'orange',
    sections: [
      { label: 'Resumen', icon: LayoutDashboard, to: '/admin/dashboard' },
      { label: 'Reservaciones', icon: CalendarCheck, to: '/admin/reservations' },
      {
        label: 'Alojamientos',
        icon: Building2,
        children: [
          { label: 'Lista', to: '/admin/lodgings' },
          { label: 'Tipos', to: '/admin/lodging-types' },
        ],
      },
      { label: 'Usuarios', icon: Users, to: '/admin/users' },
      {
        label: 'Configuraciones',
        icon: Settings,
        children: [
          { label: 'Colonia', to: '/admin/settings/settlements' },
          { label: 'Amenidades', to: '/admin/settings/amenities' },
        ],
      },
    ],
  },

  host: {
    role: 'host',
    basePath: '/host',
    label: 'Anfitrión',
    accent: 'rose',
    sections: [
      { label: 'Resumen', icon: LayoutDashboard, to: '/host/dashboard' },
      { label: 'Mis alojamientos', icon: Home, to: '/host/lodgings' },
      { label: 'Reservaciones', icon: CalendarCheck, to: '/host/reservations' },
      { label: 'Calendario', icon: CalendarDays, to: '/host/calendar' },
      { label: 'Ingresos', icon: DollarSign, to: '/host/earnings' },
    ],
  },

  guest: {
    role: 'guest',
    basePath: '/guest',
    label: 'Huésped',
    accent: 'sky',
    sections: [
      { label: 'Resumen', icon: LayoutDashboard, to: '/guest/dashboard' },
      { label: 'Mis reservas', icon: CalendarCheck, to: '/guest/reservations' },
      { label: 'Favoritos', icon: Heart, to: '/guest/favorites' },
      { label: 'Mensajes', icon: MessageSquare, to: '/guest/messages' },
      { label: 'Perfil', icon: User, to: '/guest/profile' },
    ],
  },

  support: {
    role: 'support',
    basePath: '/support',
    label: 'Soporte',
    accent: 'violet',
    sections: [
      { label: 'Resumen', icon: LayoutDashboard, to: '/support/dashboard' },
      { label: 'Tickets', icon: Ticket, to: '/support/tickets' },
      { label: 'Disputas', icon: Scale, to: '/support/disputes' },
      { label: 'Usuarios', icon: Users, to: '/support/users' },
    ],
  },
}

export function getActiveRole(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'administrator'
  if (pathname.startsWith('/host')) return 'host'
  if (pathname.startsWith('/guest')) return 'guest'
  if (pathname.startsWith('/support')) return 'support'
  return null
}

export function getDefaultPanel(role: Role): string {
  return PANELS[role].basePath
}