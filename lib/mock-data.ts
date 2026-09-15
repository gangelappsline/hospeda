import type {
  Booking,
  DashboardStats,
  Property,
  RevenuePoint,
} from "@/lib/types";

/**
 * Datos de referencia para pintar el panel mientras la API externa responde.
 * TanStack Query siempre intenta revalidarlos mediante el proxy local `/api`.
 */

export const dashboardStats: DashboardStats = {
  totalRevenue: 1284500,
  revenueChange: 12.5,
  activeBookings: 342,
  bookingsChange: 8.2,
  totalProperties: 1847,
  propertiesChange: 4.1,
  totalUsers: 12490,
  usersChange: -1.8,
};

export const revenueSeries: RevenuePoint[] = [
  { month: "Ene", value: 68000 },
  { month: "Feb", value: 74500 },
  { month: "Mar", value: 91200 },
  { month: "Abr", value: 86400 },
  { month: "May", value: 104800 },
  { month: "Jun", value: 121300 },
  { month: "Jul", value: 148900 },
  { month: "Ago", value: 156200 },
  { month: "Sep", value: 132700 },
];

export const recentBookings: Booking[] = [
  {
    id: "RES-4821",
    guestName: "Mariana Ortega",
    guestEmail: "mariana.ortega@mail.com",
    propertyName: "Loft Condesa con terraza",
    checkIn: "2026-09-18",
    checkOut: "2026-09-22",
    nights: 4,
    total: 8400,
    status: "confirmada",
  },
  {
    id: "RES-4820",
    guestName: "Diego Fuentes",
    guestEmail: "diego.fuentes@mail.com",
    propertyName: "Casa frente al mar, Tulum",
    checkIn: "2026-09-20",
    checkOut: "2026-09-27",
    nights: 7,
    total: 31500,
    status: "pendiente",
  },
  {
    id: "RES-4819",
    guestName: "Sofía Ramírez",
    guestEmail: "sofia.ramirez@mail.com",
    propertyName: "Cabaña en Valle de Bravo",
    checkIn: "2026-09-12",
    checkOut: "2026-09-15",
    nights: 3,
    total: 6900,
    status: "completada",
  },
  {
    id: "RES-4818",
    guestName: "Andrés Beltrán",
    guestEmail: "andres.beltran@mail.com",
    propertyName: "Depa en Polanco, vista Reforma",
    checkIn: "2026-09-25",
    checkOut: "2026-09-28",
    nights: 3,
    total: 11250,
    status: "confirmada",
  },
  {
    id: "RES-4817",
    guestName: "Valeria Cruz",
    guestEmail: "valeria.cruz@mail.com",
    propertyName: "Hacienda colonial, San Miguel",
    checkIn: "2026-10-02",
    checkOut: "2026-10-06",
    nights: 4,
    total: 18600,
    status: "cancelada",
  },
];

export const featuredProperties: Property[] = [
  {
    id: "PROP-101",
    title: "Loft Condesa con terraza privada",
    city: "Ciudad de México",
    country: "México",
    pricePerNight: 2100,
    rating: 4.94,
    reviews: 218,
    bedrooms: 2,
    guests: 4,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    superhost: true,
  },
  {
    id: "PROP-102",
    title: "Casa frente al mar en Tulum",
    city: "Tulum",
    country: "México",
    pricePerNight: 4500,
    rating: 4.88,
    reviews: 143,
    bedrooms: 3,
    guests: 6,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    superhost: true,
  },
  {
    id: "PROP-103",
    title: "Cabaña de madera en el bosque",
    city: "Valle de Bravo",
    country: "México",
    pricePerNight: 2300,
    rating: 4.79,
    reviews: 96,
    bedrooms: 2,
    guests: 5,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "PROP-104",
    title: "Departamento minimalista en Polanco",
    city: "Ciudad de México",
    country: "México",
    pricePerNight: 3750,
    rating: 4.91,
    reviews: 187,
    bedrooms: 1,
    guests: 2,
    status: "revision",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "PROP-105",
    title: "Hacienda colonial restaurada",
    city: "San Miguel de Allende",
    country: "México",
    pricePerNight: 4650,
    rating: 4.97,
    reviews: 254,
    bedrooms: 5,
    guests: 10,
    status: "publicada",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    superhost: true,
  },
  {
    id: "PROP-106",
    title: "Suite con alberca infinita",
    city: "Puerto Vallarta",
    country: "México",
    pricePerNight: 3980,
    rating: 4.85,
    reviews: 121,
    bedrooms: 2,
    guests: 4,
    status: "borrador",
    imageUrl:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
  },
];
