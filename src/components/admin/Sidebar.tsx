import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
  LayoutGrid,
  CalendarCheck,
  Home,
  Users,
  Settings,
  ChevronDown,
} from 'lucide-react'

interface MenuItem {
  label: string
  icon: React.ReactNode
  to?: string
  children?: { label: string; to: string }[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Resumen',
    icon: <LayoutGrid size={18} />,
    to: '/admin/dashboard',
  },
  {
    label: 'Reservaciones',
    icon: <CalendarCheck size={18} />,
    to: '/admin/reservations',
  },
  {
    label: 'Alojamientos',
    icon: <Home size={18} />,
    children: [
      { label: 'Lista', to: '/admin/lodgings' },
      { label: 'Tipos', to: '/admin/lodging-types' },
    ],
  },
  {
    label: 'Usuarios',
    icon: <Users size={18} />,
    to: '/admin/users',
  },
  {
    label: 'Configuraciones',
    icon: <Settings size={18} />,
    children: [
      { label: 'Colonia', to: '/admin/settings/settlements' },
      { label: 'Amenidades', to: '/admin/settings/amenities' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    // Abrir automáticamente el menú que contiene la ruta actual
    const active = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.to))
    )
    return active ? [active.label] : []
  })

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isChildActive = (item: MenuItem) =>
    item.children?.some((child) => location.pathname.startsWith(child.to))

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
          <Home size={18} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900 tracking-tight">
          Hospeda
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Panel
        </p>

        <ul className="space-y-1">
          {menuItems.map((item) => {
            const hasChildren = !!item.children
            const isOpen = openMenus.includes(item.label)
            const childActive = isChildActive(item)

            // Item sin submenú
            if (!hasChildren) {
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to!}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <span className="text-current">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              )
            }

            // Item con submenú
            return (
              <li key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    childActive
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-1">
                    {item.children!.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-orange-50 text-orange-600 font-medium'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Hospeda Admin v1.0
        </p>
      </div>
    </aside>
  )
}