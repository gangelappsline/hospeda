/** Tipos compartidos del dominio de Hospeda. */

export type UserRole = "admin" | "host" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}

/** Métricas que alimentan las tarjetas del panel administrativo. */
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeBookings: number;
  bookingsChange: number;
  totalProperties: number;
  propertiesChange: number;
  totalUsers: number;
  usersChange: number;
}

export type BookingStatus = "confirmada" | "pendiente" | "cancelada" | "completada";

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: BookingStatus;
}

export type PropertyStatus = "publicada" | "borrador" | "revision";

export interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  bedrooms: number;
  guests: number;
  status: PropertyStatus;
  imageUrl: string;
  superhost?: boolean;
  propertyType?: string;
}

export interface PropertyType {
  id: string;
  name: string;
  description?: string | null;
  propertyCount?: number;
  active?: boolean;
}

export interface Country {
  id: string;
  name: string;
  code?: string;
}

export interface State {
  id: string;
  name: string;
  countryId: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
}

export interface Colony {
  id: string;
  name: string;
  postalCode: string;
  countryId: string;
  countryName?: string;
  stateId: string;
  stateName?: string;
  cityId: string;
  cityName?: string;
  createdAt?: string;
}

export interface RevenuePoint {
  month: string;
  value: number;
}

/** Forma del error que devuelve el cliente HTTP. */
export interface ApiErrorShape {
  message: string;
  status: number;
  details?: unknown;
}
