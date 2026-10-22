import { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, ChevronDown } from 'lucide-react'
import {
  PANELS,
  getActiveRole,
  type PanelSection,
  type PanelConfig,
} from '@/config/panels'
import LogoIcon from '@/assets/images/icon.webp'

/** Mapa de clases Tailwind por color para evitar templates dinámicos que Tailwind no detecta. */
const ACCENT_CLASSES: Record<
  PanelConfig['accent'],
  {
    bg: string
    bgSoft: string
    text: string
    border: string
    ring: string
  }
> = {
  'vivid-tangerine': {
    bg: 'bg-vivid-tangerine-500',
    bgSoft: 'bg-vivid-tangerine-50',
    text: 'text-vivid-tangerine-600',
    border: 'border-vivid-tangerine-200',
    ring: 'focus:ring-vivid-tangerine-500',
  },
  'pacific-blue': {
    bg: 'bg-pacific-blue-500',
    bgSoft: 'bg-pacific-blue-50',
    text: 'text-pacific-blue-600',
    border: 'border-pacific-blue-200',
    ring: 'focus:ring-pacific-blue-500',
  },
  'tangerine-dream': {
    bg: 'bg-tangerine-dream-500',
    bgSoft: 'bg-tangerine-dream-50',
    text: 'text-tangerine-dream-600',
    border: 'border-tangerine-dream-200',
    ring: 'focus:ring-tangerine-dream-500',
  },
  'cool-steel': {
    bg: 'bg-cool-steel-500',
    bgSoft: 'bg-cool-steel-50',
    text: 'text-cool-steel-600',
    border: 'border-cool-steel-200',
    ring: 'focus:ring-cool-steel-500',
  },
  parchment: {
    bg: 'bg-parchment-500',
    bgSoft: 'bg-parchment-50',
    text: 'text-parchment-600',
    border: 'border-parchment-200',
    ring: 'focus:ring-parchment-500',
  },
}

export default function Sidebar() {
  const location = useLocation()
  const activeRole = getActiveRole(location.pathname)
  const panel = activeRole ? PANELS[activeRole] : PANELS.administrator
  const accent = ACCENT_CLASSES[panel.accent]

  // ¿Qué submenús deben estar abiertos al cargar?
  const initialOpenMenus = useMemo(() => {
    return panel.sections
      .filter((s) =>
        s.children?.some((c) => location.pathname.startsWith(c.to))
      )
      .map((s) => s.label)
  }, [panel, location.pathname])

  console.log('Active role:', activeRole)
  console.log('Panel:', panel)
  console.log('Accent classes:', accent)
  console.log('Initial open menus:', initialOpenMenus)
  const [openMenus, setOpenMenus] = useState<string[]>(initialOpenMenus)

  // Sincronizar cuando cambia el panel activo (por ejemplo, de admin a host)
  const [lastRole, setLastRole] = useState(activeRole)
  if (lastRole !== activeRole) {
    setLastRole(activeRole)
    setOpenMenus(initialOpenMenus)
  }

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isSectionActive = (section: PanelSection) =>
    section.children?.some((c) => location.pathname.startsWith(c.to)) ?? false

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-cool-steel-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-cool-steel-100">
        <div
          className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center`}
        >
          <img src={LogoIcon} alt="Logo" className="h-8" />
        </div>
        <span className="text-lg font-semibold text-cool-steel-900 tracking-tight">
          Hospeda
        </span>
      </div>

      {/* Badge del panel activo */}
      <div className="px-5 pt-5">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-white ${accent.bg}`}
        >
          {panel.label}
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-xs font-semibold text-cool-steel-400 uppercase tracking-wider">
          Panel
        </p>

        <ul className="space-y-1">
          {panel.sections.map((section) => {
            const hasChildren = !!section.children?.length
            const isOpen = openMenus.includes(section.label)
            const childActive = isSectionActive(section)

            // ---- Item simple (sin submenú) ----
            if (!hasChildren) {
              return (
                <li key={section.label}>
                  <NavLink
                    to={section.to!}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? `${accent.bgSoft} ${accent.text}`
                          : 'text-cool-steel-600 hover:bg-cool-steel-50 hover:text-cool-steel-900'
                      }`
                    }
                  >
                    <section.icon size={18} className="shrink-0" />
                    {section.label}
                  </NavLink>
                </li>
              )
            }

            // ---- Item con submenú ----
            return (
              <li key={section.label}>
                <button
                  type="button"
                  onClick={() => toggleMenu(section.label)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    childActive
                      ? accent.text
                      : 'text-cool-steel-600 hover:bg-cool-steel-50 hover:text-cool-steel-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <section.icon size={18} className="shrink-0" />
                    {section.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-1 ml-4 pl-3 border-l border-cool-steel-200 space-y-1">
                    {section.children!.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? `${accent.bgSoft} ${accent.text} font-medium`
                                : 'text-cool-steel-500 hover:text-cool-steel-900 hover:bg-cool-steel-50'
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
      <div className="p-4 border-t border-cool-steel-100">
        <p className="text-xs text-cool-steel-400 text-center">
          Hospeda · {panel.label}
        </p>
      </div>
    </aside>
  )
}