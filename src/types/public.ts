export interface FeaturedStay {
  id: number
  title: string
  location: string
  rating: number
  guests: number
  bedrooms: number
  price_per_night: number
  image_url: string
  is_superhost: boolean
  category: string
}

export type StayCategory =
  | 'all'
  | 'cabins'
  | 'incredible'
  | 'design'
  | 'city'
  | 'haciendas'
  | 'views'
  | 'pets'