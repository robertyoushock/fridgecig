// ═══════════════════════════════════════════════════════
// THE DIET COKE INDEX — Type Definitions
// Treating a 12oz aluminum can with the same cold,
// ruthless financial precision as the Bloomberg Terminal.
// ═══════════════════════════════════════════════════════

export type PuristMode = 'anything' | 'can' | 'fountain'

export interface Coordinates {
  lat: number
  lng: number
}

export interface MetroHub {
  name: string
  label: string
  coords: Coordinates
  zip: string
}

export interface ZipLookupEntry {
  label: string
  region: string
  lat: number
  lng: number
}

export interface ZipResolution {
  zip: string
  coords: Coordinates
  label: string
  hubKey: string
  status: 'exact' | 'metro_estimate' | 'national_fallback'
  warning: string | null
}

export type GeolocationErrorReason =
  | 'unsupported'
  | 'denied'
  | 'timeout'
  | 'unavailable'

export type StashSource =
  | 'kroger_live'
  | 'fallback_directory'
  | 'outside_kroger_region'
  | 'local_directory'

/** Single-serve immediate purchase result */
export interface BurnResult {
  price: number
  formatted_price: string
  size: string                    // "32oz Fountain" or "20oz Bottle"
  store_name: string              // "McDonald's" or "Circle K"
  store_type: 'mcdonalds' | 'gas_station' | 'convenience' | 'fast_food'
  distance_mi: number
  unit_cost_per_oz: number
  walk_time_mins: number
  maps_url: string
  apple_maps_url?: string
  google_maps_url?: string
  gold_standard?: boolean
  vs_bottle_spread?: number
  caffeine_mg?: number
  runner_up?: {
    store_name: string
    size: string
    price: number
    formatted_price: string
    unit_cost_per_oz: number
  } | null
}

/** Individual bulk package format tier */
export interface BulkPackTier {
  format: '12pk' | '24pk' | 'costco'
  label: string                   // "12-Pack", "24-Pack", "Costco 36-Pack"
  store_name: string              // "King Soopers" or "Costco Wholesale"
  store_address?: string
  pack_desc: string
  price: number
  formatted_price: string
  cans: number
  unit_cost_per_can: number
  caffeine_cost_per_mg: number
  vs_bodega_spread: number
  deal_badge?: string | null
  distance_mi: number
  maps_url: string
  apple_maps_url?: string
  google_maps_url?: string
  is_live_api?: boolean
  is_best_unit_cost?: boolean
  min_units?: number              // e.g. 5 for buy-5 promo
  upfront_cost?: number           // e.g. 24.95
  formatted_upfront?: string      // "$24.95 (5 pks req)" or "$13.00 upfront"
}

/** Bulk stock-up deal result */
export interface StashResult {
  price: number
  formatted_price: string
  pack_desc: string               // "24-Pack Cans"
  cans?: number                   // total cans in pack format
  store_name: string              // "King Soopers"
  distance_mi: number
  deal_badge: string | null       // "🔥 FRI–MON WEEKEND WARRIOR PROMO ($0.37/can)"
  unit_cost_per_can: number
  caffeine_cost_per_mg: number    // cost per mg of caffeine
  vs_bodega_spread: number        // -86 = 86% cheaper than bodega single
  maps_url: string
  apple_maps_url?: string
  google_maps_url?: string
  is_live_api?: boolean           // True ONLY on genuine live Kroger API response
  source?: StashSource
  coverage?: boolean
  error?: string
  store_address?: string
  zip_code?: string
  last_updated?: string
  min_units?: number
  upfront_cost?: number
  formatted_upfront?: string
  runner_up: {
    store_name: string
    deal_desc: string             // "3 for $18 (12-Packs) w/ Circle"
    price: number
  } | null
  pack_tiers?: {
    pack12?: BulkPackTier
    pack24?: BulkPackTier
    costco?: BulkPackTier
  }
}

/** Live ticker tape data */
export interface TickerData {
  spot_price_per_oz: number
  spot_direction: 'up' | 'down'
  avg_12pk: number
  avg_12pk_direction: 'up' | 'down'
  fountain_spread_pct: number
}

/** Root aggregation state for the terminal */
export interface IndexData {
  burn: BurnResult
  stash: StashResult
  ticker: TickerData
  location_label: string
  timestamp?: string
}
