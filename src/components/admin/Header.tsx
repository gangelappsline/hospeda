import { Search, Bell } from 'lucide-react'
import UserDropdown from './UserDropdown'

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-cool-steel-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Buscador */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
          />
          <input
            type="text"
            placeholder="Buscar reservación, alojamiento o huésped..."
            className="w-full rounded-lg border border-cool-steel-200 bg-cool-steel-50 py-2.5 pl-10 pr-4 text-sm text-cool-steel-700 placeholder-cool-steel-400 focus:border-vivid-tangerine-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
          />
        </div>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-3 ml-6">
        {/* Notificaciones */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-cool-steel-50 hover:text-cool-steel-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-vivid-tangerine-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Dropdown de usuario */}
        <UserDropdown />
      </div>
    </header>
  )
}