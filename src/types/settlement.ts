export interface Country {
  id: number
  name: string
}

export interface State {
  id: number
  name: string
  country_id: number
}

export interface City {
  id: number
  name: string
  state_id: number
}

export interface Settlement {
  id: number
  name: string
  zip_code: string
  city_id: number
  city?: { id: number; name: string }
  state?: { id: number; name: string }
  country?: { id: number; name: string }
  created_at?: string
  updated_at?: string
}

export interface SettlementPayload {
  name: string
  zip_code: string
  city_id: number
  state_id: number
}