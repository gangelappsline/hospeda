import { Star } from 'lucide-react'

const properties = [
  {
    name: 'Loft Condesa con terraza privada',
    location: 'Ciudad de México',
    rating: 4.94,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&q=80',
  },
  {
    name: 'Casa frente al mar en Tulum',
    location: 'Tulum',
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&q=80',
  },
  {
    name: 'Cabaña de madera en el bosque',
    location: 'Valle de Bravo',
    rating: 4.79,
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=100&q=80',
  },
  {
    name: 'Departamento minimalista en Polanco',
    location: 'Ciudad de México',
    rating: 4.91,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=80',
  },
]

export default function TopProperties() {
  return (
    <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-cool-steel-900">
          Propiedades destacadas
        </h3>
        <p className="text-sm text-cool-steel-500">Por calificación de huéspedes</p>
      </div>

      <ul className="space-y-3">
        {properties.map((property) => (
          <li
            key={property.name}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-cool-steel-50 transition-colors cursor-pointer"
          >
            <img
              src={property.image}
              alt={property.name}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cool-steel-900 truncate">
                {property.name}
              </p>
              <p className="text-xs text-cool-steel-500">{property.location}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="fill-tangerine-dream-400 text-tangerine-dream-400" />
              <span className="text-sm font-medium text-cool-steel-700">
                {property.rating}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}