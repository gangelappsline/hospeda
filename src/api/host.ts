import type { HostLodging } from '@/types/hostLodgings'
import { apiFetch } from '@/api/client'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''

// ---- Forma cruda ----
interface ApiHostLodging {
  id: number
  title: string | null
  description: string | null
  slug: string | null
  base_price: string | null
  cleaning_fee: string | null
  service_fee: string | null
  security_deposit: string | null
  bathrooms: number
  bedrooms: number
  beds: number
  capacity: number
  lodging_scope: 'entire_place' | 'private_room' | 'shared_room'
  status: string
  rating: string
  reviews: number | unknown[]
  type: { id: number; name: string }
  address: {
    street: string
    city: string
    state: string
    country: string
    zip_code: string
    formatted_address: string
  } | null
  photos: Array<{
    id: number
    photo: string
    thumbnail: string
    order: number
    cover: number
  }>
  amenities: Array<{ id: number; amenity_id: number; name: string; icon: string }>
  created_at?: string
  updated_at?: string
}

interface ApiListResponse<T> {
  success: boolean
  data: T[]
  message: string
}

interface ApiItemResponse<T> {
  success: boolean
  data: T
  message: string
}

// ---- Mapper ----
function mapHostLodging(raw: ApiHostLodging): HostLodging {
  const coverPhoto =
    raw.photos.find((p) => p.cover === 1) ?? raw.photos[0] ?? null

  return {
    id: raw.id,
    title: raw.title ?? 'Sin título',
    slug: raw.slug ?? '',
    description: raw.description ?? '',
    status: (raw.status as HostLodging['status']) ?? 'draft',
    base_price: Number(raw.base_price) || 0,
    cleaning_fee: Number(raw.cleaning_fee) || 0,
    service_fee: Number(raw.service_fee) || 0,
    security_deposit: Number(raw.security_deposit) || 0,
    bathrooms: raw.bathrooms,
    bedrooms: raw.bedrooms,
    beds: raw.beds,
    guests: raw.capacity,
    lodging_scope: raw.lodging_scope,
    rating: Number(raw.rating) || 0,
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.length
      : Number(raw.reviews) || 0,
    type: raw.type,
    address: raw.address,
    photos: raw.photos.map((p) => ({
      id: p.id,
      photo: p.photo,
      thumbnail: p.thumbnail,
      order: p.order,
      cover: p.cover,
    })),
    cover: coverPhoto?.thumbnail ?? coverPhoto?.photo ?? null,
    amenitiesCount: raw.amenities?.length ?? 0,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// ---- Endpoints ----
export async function getHostLodgings(): Promise<HostLodging[]> {
  const res = await apiFetch(`${API_BASE_URL}/web/admin/lodgings`)
  const json: ApiListResponse<ApiHostLodging> = await res.json()
  if (!json.success) throw new Error(json.message)
  return (json.data ?? []).map(mapHostLodging)
}

export async function getHostLodging(id: number): Promise<HostLodging> {
  const res = await apiFetch(`${API_BASE_URL}/host/lodgings/${id}`)
  const json: ApiItemResponse<ApiHostLodging> = await res.json()
  if (!json.success) throw new Error(json.message)
  return mapHostLodging(json.data)
}

export async function createHostLodging(
  payload: Record<string, unknown>
): Promise<HostLodging> {
  const res = await apiFetch(`${API_BASE_URL}/host/lodgings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok && json.message) throw new Error(json.message)
  return mapHostLodging(json.data ?? json)
}

export async function updateHostLodging(
  id: number,
  payload: Record<string, unknown>
): Promise<HostLodging> {
  const res = await apiFetch(`${API_BASE_URL}/host/lodgings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok && json.message) throw new Error(json.message)
  return mapHostLodging(json.data ?? json)
}

export async function deleteHostLodging(id: number): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/host/lodgings/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Error al eliminar: ${res.status}`)
}

export async function toggleHostLodgingStatus(
  id: number,
  status: 'published' | 'draft'
): Promise<HostLodging> {
  const res = await apiFetch(`${API_BASE_URL}/host/lodgings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const json: ApiItemResponse<ApiHostLodging> = await res.json()
  if (!json.success) throw new Error(json.message)
  return mapHostLodging(json.data)
}