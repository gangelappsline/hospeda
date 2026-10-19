interface Booking {
  guest: string
  property: string
  dates: string
  total: string
  status: 'Confirmada' | 'Pendiente' | 'Cancelada'
}

const bookings: Booking[] = [
  {
    guest: 'María González',
    property: 'Loft Condesa con terraza privada',
    dates: '12 - 15 Oct 2026',
    total: '$4,500',
    status: 'Confirmada',
  },
  {
    guest: 'Carlos Ramírez',
    property: 'Casa frente al mar en Tulum',
    dates: '18 - 22 Oct 2026',
    total: '$12,800',
    status: 'Pendiente',
  },
  {
    guest: 'Ana Martínez',
    property: 'Cabaña de madera en el bosque',
    dates: '25 - 27 Oct 2026',
    total: '$3,200',
    status: 'Confirmada',
  },
  {
    guest: 'Luis Hernández',
    property: 'Departamento minimalista en Polanco',
    dates: '01 - 05 Nov 2026',
    total: '$6,750',
    status: 'Cancelada',
  },
]

const statusStyles: Record<Booking['status'], string> = {
  Confirmada: 'bg-pacific-blue-50 text-pacific-blue-600',
  Pendiente: 'bg-tangerine-dream-50 text-tangerine-dream-600',
  Cancelada: 'bg-vivid-tangerine-50 text-vivid-tangerine-500',
}

export default function RecentBookings() {
  return (
    <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-cool-steel-100">
        <div>
          <h3 className="text-base font-semibold text-cool-steel-900">
            Reservaciones recientes
          </h3>
          <p className="text-sm text-cool-steel-500">
            Últimos movimientos en tus propiedades
          </p>
        </div>
        <button className="text-sm font-medium text-vivid-tangerine-600 hover:text-vivid-tangerine-700">
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cool-steel-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                Huésped
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, i) => (
              <tr
                key={i}
                className="border-b border-cool-steel-50 last:border-0 hover:bg-cool-steel-50 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium text-cool-steel-900">
                  {booking.guest}
                </td>
                <td className="px-5 py-3.5 text-cool-steel-600">{booking.property}</td>
                <td className="px-5 py-3.5 text-cool-steel-600">{booking.dates}</td>
                <td className="px-5 py-3.5 font-medium text-cool-steel-900">
                  {booking.total}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusStyles[booking.status]
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}