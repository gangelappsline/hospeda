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
  Confirmada: 'bg-emerald-50 text-emerald-600',
  Pendiente: 'bg-amber-50 text-amber-600',
  Cancelada: 'bg-red-50 text-red-500',
}

export default function RecentBookings() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Reservaciones recientes
          </h3>
          <p className="text-sm text-gray-500">
            Últimos movimientos en tus propiedades
          </p>
        </div>
        <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Huésped
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  {booking.guest}
                </td>
                <td className="px-5 py-3.5 text-gray-600">{booking.property}</td>
                <td className="px-5 py-3.5 text-gray-600">{booking.dates}</td>
                <td className="px-5 py-3.5 font-medium text-gray-900">
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