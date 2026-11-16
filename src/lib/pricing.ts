// ═══════════════════════════════════════════════════════════════════
// PRICING ENGINE — Diet Coke Index Intelligence Core
// Deterministic pricing calculations seeded by lat/lng coordinates.
// ═══════════════════════════════════════════════════════════════════

import {
  SINGLE_SERVE_MATRIX,
  BULK_DEALS,
  REFERENCE_CONSTANTS,
} from '@/data/store-matrix'
import type { BurnResult, StashResult, BulkPackTier, TickerData, IndexData, PuristMode } from '@/types'
import { estimateWalkTime, getAppleMapsUrl, getGoogleMapsUrl } from '@/lib/geolocation'
import { findLocalKingSoopers } from '@/lib/kroger'

// ---------------------------------------------------------------------------
// Deterministic pseudo-random seeded by coordinates
// ---------------------------------------------------------------------------

function seedFromCoords(lat: number, lng: number, salt: number = 0): number {
  const x = Math.sin(lat * 12.9898 + lng * 78.233 + salt) * 43758.5453
  return x - Math.floor(x) // 0..1
}

function seededVariance(
  lat: number,
  lng: number,
  salt: number,
  range: number,
): number {
  return (seedFromCoords(lat, lng, salt) - 0.5) * 2 * range
}

function seededPick<T>(arr: T[], lat: number, lng: number, salt: number): T {
  const idx = Math.floor(seedFromCoords(lat, lng, salt) * arr.length)
  return arr[Math.min(idx, arr.length - 1)]
}

// ---------------------------------------------------------------------------
// Location-aware neighborhood labels
// ---------------------------------------------------------------------------

interface NeighborhoodEntry {
  latRange: [number, number]
  lngRange: [number, number]
  label: string
}

const NEIGHBORHOOD_LOOKUP: NeighborhoodEntry[] = [
  { latRange: [39.5, 40.0], lngRange: [-105.5, -104.5], label: 'Capitol Hill, Denver' },
  { latRange: [40.5, 41.0], lngRange: [-74.5, -73.5], label: 'Midtown, Manhattan' },
  { latRange: [33.8, 34.2], lngRange: [-118.8, -118.0], label: 'Silver Lake, LA' },
  { latRange: [41.7, 42.1], lngRange: [-88.0, -87.4], label: 'Lincoln Park, Chicago' },
  { latRange: [47.4, 47.8], lngRange: [-122.6, -122.1], label: 'Capitol Hill, Seattle' },
  { latRange: [29.6, 30.0], lngRange: [-95.7, -95.1], label: 'Montrose, Houston' },
  { latRange: [33.6, 34.0], lngRange: [-84.6, -84.2], label: 'Midtown, Atlanta' },
  { latRange: [25.6, 26.0], lngRange: [-80.4, -80.0], label: 'Wynwood, Miami' },
  { latRange: [37.7, 38.0], lngRange: [-122.6, -122.2], label: 'Mission District, SF' },
  { latRange: [30.2, 30.4], lngRange: [-97.9, -97.5], label: 'East Austin, TX' },
  { latRange: [38.8, 39.1], lngRange: [-77.2, -76.8], label: 'Dupont Circle, DC' },
  { latRange: [42.3, 42.5], lngRange: [-71.2, -70.9], label: 'Back Bay, Boston' },
  { latRange: [39.9, 40.1], lngRange: [-75.3, -75.0], label: 'Fishtown, Philadelphia' },
]

export function getNeighborhoodLabel(lat: number, lng: number): string {
  for (const n of NEIGHBORHOOD_LOOKUP) {
    if (
      lat >= n.latRange[0] &&
      lat <= n.latRange[1] &&
      lng >= n.lngRange[0] &&
      lng <= n.lngRange[1]
    ) {
      return n.label
    }
  }
  return `SECTOR [${lat.toFixed(3)}, ${lng.toFixed(3)}]`
}

function resolveRegionHints(lat: number, lng: number, zip?: string): string[] {
  if (zip) {
    if (zip.startsWith('80')) return ['denver', 'colorado']
    if (zip.startsWith('100') || zip.startsWith('101') || zip.startsWith('102')) return ['manhattan', 'nyc', 'new-york']
    if (zip.startsWith('606')) return ['chicago']
    if (zip.startsWith('900') || zip.startsWith('902')) return ['los-angeles', 'la', 'california']
    if (zip.startsWith('787')) return ['austin', 'texas']
    if (zip.startsWith('981')) return ['seattle', 'pacific-northwest']
    if (zip.startsWith('331')) return ['miami', 'florida']
  }

  if (lat >= 39.5 && lat <= 40.2 && lng >= -105.4 && lng <= -104.6) return ['denver', 'colorado']
  if (lat >= 40.5 && lat <= 41.0 && lng >= -74.3 && lng <= -73.6) return ['manhattan', 'nyc', 'new-york']
  if (lat >= 41.6 && lat <= 42.1 && lng >= -88.0 && lng <= -87.4) return ['chicago']
  if (lat >= 33.7 && lat <= 34.4 && lng >= -118.7 && lng <= -118.0) return ['los-angeles', 'la', 'california']
  if (lat >= 30.1 && lat <= 30.5 && lng >= -97.9 && lng <= -97.5) return ['austin', 'texas']
  if (lat >= 47.4 && lat <= 47.8 && lng >= -122.5 && lng <= -122.1) return ['seattle', 'pacific-northwest']
  if (lat >= 25.5 && lat <= 26.0 && lng >= -80.4 && lng <= -80.0) return ['miami', 'florida']

  return ['national']
}

// ---------------------------------------------------------------------------
// 1. THE BURN: Best single-serve drink
// ---------------------------------------------------------------------------

export function findBestBurn(
  lat: number,
  lng: number,
  mode: PuristMode = 'anything',
): BurnResult {
  const storeKeys = Object.keys(SINGLE_SERVE_MATRIX)
  const candidateKeys = ['mcdonalds', 'circle-k', '7-eleven', 'wendys', 'conoco', 'racetrac', 'bodega']

  interface ScoredOption {
    key: string
    sizeIdx: number
    unitCostPerOz: number
    price: number
    distance: number
    size: string
    oz: number
  }

  let candidates: ScoredOption[] = []

  for (const key of candidateKeys) {
    const store = SINGLE_SERVE_MATRIX[key]
    if (!store) continue

    for (let si = 0; si < store.sizes.length; si++) {
      const s = store.sizes[si]
      const sizeLower = s.size.toLowerCase()
      const isFountain = sizeLower.includes('fountain') || sizeLower.includes('gulp') || sizeLower.includes('polar')
      const isCanOrBottle = sizeLower.includes('can') || sizeLower.includes('bottle')

      if (mode === 'fountain' && !isFountain) continue
      if (mode === 'can' && !isCanOrBottle) continue

      const priceVariance = seededVariance(lat, lng, key.length + si, 0.15)
      const finalPrice = Math.max(0.69, Math.round((s.price + priceVariance) * 100) / 100)
      const baseDist = 0.3 + seedFromCoords(lat, lng, key.length * 3 + si) * 1.5
      const distance = Math.round(baseDist * 10) / 10

      candidates.push({
        key,
        sizeIdx: si,
        unitCostPerOz: finalPrice / s.oz,
        price: finalPrice,
        distance,
        size: s.size,
        oz: s.oz,
      })
    }
  }

  candidates.sort((a, b) => a.unitCostPerOz - b.unitCostPerOz)
  const best = candidates[0] || {
    key: 'mcdonalds',
    sizeIdx: 2,
    unitCostPerOz: 0.05,
    price: 1.49,
    distance: 0.4,
    size: 'Large (30oz)',
    oz: 30,
  }

  const store = SINGLE_SERVE_MATRIX[best.key]
  const isGoldStandard = (best.key === 'mcdonalds' || store.type === 'mcdonalds') && best.distance <= 1.2
  const googleUrl = getGoogleMapsUrl(store.name, lat, lng, 'walking')
  const appleUrl = getAppleMapsUrl(store.name, lat, lng, 'walking')

  return {
    price: best.price,
    formatted_price: `$${best.price.toFixed(2)}`,
    size: best.size,
    store_name: store.name,
    store_type: store.type,
    distance_mi: best.distance,
    unit_cost_per_oz: Math.round(best.unitCostPerOz * 1000) / 1000,
    walk_time_mins: estimateWalkTime(best.distance),
    maps_url: googleUrl,
    apple_maps_url: appleUrl,
    google_maps_url: googleUrl,
    gold_standard: isGoldStandard,
  }
}

// ---------------------------------------------------------------------------
// 2. THE STASH: Best bulk fridge-loading stock-up
// ---------------------------------------------------------------------------

export function findBestStash(lat: number, lng: number, zip?: string): StashResult {
  const regionHints = resolveRegionHints(lat, lng, zip)

  let matchingDeals = BULK_DEALS.filter((d) =>
    d.regions.some((r) => regionHints.includes(r)),
  )

  const hasRegional = matchingDeals.some((d) => !d.regions.includes('national'))
  if (hasRegional) {
    matchingDeals = matchingDeals.filter((d) => !d.regions.includes('national'))
  }

  if (regionHints.includes('denver') || regionHints.includes('colorado')) {
    const ks = findLocalKingSoopers(lat, lng, zip)
    const ksAddress = `${ks.address}, ${ks.city}, ${ks.state} ${ks.zip}`
    matchingDeals = matchingDeals.map((d) => {
      if (d.store.toLowerCase().includes('king soopers')) {
        return {
          ...d,
          store: ks.name,
          store_address: ksAddress,
        }
      }
      return d
    })
  }

  interface ScoredDeal {
    deal: (typeof BULK_DEALS)[number]
    perCan: number
    distance: number
  }

  const scored: ScoredDeal[] = matchingDeals.map((deal, i) => {
    const perCan = deal.effective_per_can ?? deal.price / deal.cans
    const distVariance = seededVariance(lat, lng, 50 + i, 0.4)
    const adjustedDist = Math.round(Math.max(0.3, deal.distance_mi + distVariance) * 10) / 10
    return { deal, perCan, distance: adjustedDist }
  })

  scored.sort((a, b) => a.perCan - b.perCan)

  const best = scored[0] || { deal: BULK_DEALS[0], perCan: 0.42, distance: 1.1 }
  const runnerUp = scored.length > 1 ? scored[1] : null

  const caffeinePerMg = best.perCan / REFERENCE_CONSTANTS.CAFFEINE_MG_PER_12OZ
  const bodegaSpread = ((best.perCan - REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) / REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) * 100

  const storeQuery = best.deal.store_address ? `${best.deal.store} ${best.deal.store_address}` : best.deal.store
  const googleUrl = getGoogleMapsUrl(storeQuery, lat, lng, 'driving')
  const appleUrl = getAppleMapsUrl(storeQuery, lat, lng, 'driving')

  function buildTier(
    deal: (typeof BULK_DEALS)[number],
    format: '12pk' | '24pk' | 'costco',
    label: string,
    isBest: boolean
  ): BulkPackTier {
    const perCan = deal.effective_per_can ?? deal.price / deal.cans
    const unitCost = Math.round(perCan * 100) / 100
    const caffeine = Math.round((unitCost / REFERENCE_CONSTANTS.CAFFEINE_MG_PER_12OZ) * 10000) / 10000
    const spread = Math.round(((unitCost - REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) / REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) * 1000) / 10
    const query = deal.store_address ? `${deal.store} ${deal.store_address}` : deal.store
    const minUnits = deal.min_units ?? (deal.pack_desc.toLowerCase().includes('buy 5') ? 5 : 1)
    const upfrontCost = deal.upfront_cost ?? Math.round(deal.price * minUnits * 100) / 100
    const formattedUpfront = minUnits > 1
      ? `$${upfrontCost.toFixed(2)} (${minUnits} pks req)`
      : `$${upfrontCost.toFixed(2)} upfront`

    return {
      format,
      label,
      store_name: deal.store,
      store_address: deal.store_address,
      pack_desc: deal.pack_desc,
      price: deal.price,
      formatted_price: `$${deal.price.toFixed(2)}`,
      cans: deal.cans,
      unit_cost_per_can: unitCost,
      caffeine_cost_per_mg: caffeine,
      vs_bodega_spread: spread,
      deal_badge: deal.deal_badge,
      distance_mi: deal.distance_mi,
      maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
      apple_maps_url: getAppleMapsUrl(query, lat, lng, 'driving'),
      google_maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
      is_best_unit_cost: isBest,
      min_units: minUnits,
      upfront_cost: upfrontCost,
      formatted_upfront: formattedUpfront,
    }
  }

  const deals12 = matchingDeals.filter((d) => d.cans === 12)
  const best12Deal = deals12.length > 0
    ? deals12.reduce((prev, curr) => {
        const pCost = prev.effective_per_can ?? prev.price / prev.cans
        const cCost = curr.effective_per_can ?? curr.price / curr.cans
        return cCost < pCost ? curr : prev
      })
    : null

  const deals24 = matchingDeals.filter((d) => d.cans === 24)
  const best24Deal = deals24.length > 0
    ? deals24.reduce((prev, curr) => {
        const pCost = prev.effective_per_can ?? prev.price / prev.cans
        const cCost = curr.effective_per_can ?? curr.price / curr.cans
        return cCost < pCost ? curr : prev
      })
    : null

  const costcoDeal =
    matchingDeals.find((d) => d.store.toLowerCase().includes('costco')) ??
    BULK_DEALS.find((d) => d.store.toLowerCase().includes('costco') && d.regions.includes('national')) ??
    {
      store: 'Costco Wholesale (Denver Central)',
      pack_desc: '36-Pack Cans',
      price: 17.49,
      cans: 36,
      oz_per_can: 12,
      deal_badge: '🏪 MEMBERS ONLY — CLUB BENCHMARK ($0.49/can)',
      deal_desc: 'Costco Wholesale 36-Can Flat',
      effective_per_can: 0.49,
      min_units: 1,
      upfront_cost: 17.49,
      regions: ['denver', 'colorado'],
      distance_mi: 3.8,
      store_address: '400 S Zuni St, Denver, CO 80223',
    }

  const pack12Tier = best12Deal ? buildTier(best12Deal, '12pk', '12-Pack', best12Deal === best.deal) : undefined
  const pack24Tier = best24Deal ? buildTier(best24Deal, '24pk', '24-Pack', best24Deal === best.deal) : undefined
  const costcoTier = costcoDeal ? buildTier(costcoDeal, 'costco', 'Costco 36-Pk', costcoDeal === best.deal) : undefined

  const bestMinUnits = best.deal.min_units ?? (best.deal.pack_desc.toLowerCase().includes('buy 5') ? 5 : 1)
  const bestUpfrontCost = best.deal.upfront_cost ?? Math.round(best.deal.price * bestMinUnits * 100) / 100
  const bestFormattedUpfront = bestMinUnits > 1
    ? `$${bestUpfrontCost.toFixed(2)} (${bestMinUnits} pks req)`
    : `$${bestUpfrontCost.toFixed(2)} upfront`

  return {
    price: best.deal.price,
    formatted_price: `$${best.deal.price.toFixed(2)}`,
    pack_desc: best.deal.pack_desc,
    store_name: best.deal.store,
    store_address: best.deal.store_address,
    zip_code: zip,
    distance_mi: best.distance,
    deal_badge: best.deal.deal_badge,
    unit_cost_per_can: Math.round(best.perCan * 100) / 100,
    caffeine_cost_per_mg: Math.round(caffeinePerMg * 10000) / 10000,
    vs_bodega_spread: Math.round(bodegaSpread * 10) / 10,
    maps_url: googleUrl,
    apple_maps_url: appleUrl,
    google_maps_url: googleUrl,
    min_units: bestMinUnits,
    upfront_cost: bestUpfrontCost,
    formatted_upfront: bestFormattedUpfront,
    runner_up: runnerUp
      ? {
          store_name: runnerUp.deal.store,
          deal_desc: runnerUp.deal.deal_desc ?? `${runnerUp.deal.pack_desc} @ $${runnerUp.deal.price.toFixed(2)}`,
          price: runnerUp.deal.price,
        }
      : null,
    pack_tiers: {
      pack12: pack12Tier,
      pack24: pack24Tier,
      costco: costcoTier,
    },
  }
}

// ---------------------------------------------------------------------------
// 3. AGGREGATED INDEX INTELLIGENCE
// ---------------------------------------------------------------------------

export function getIndexData(
  lat: number,
  lng: number,
  mode: PuristMode = 'anything',
  zip?: string,
): IndexData {
  const burn = findBestBurn(lat, lng, mode)
  const stash = findBestStash(lat, lng, zip)
  const label = getNeighborhoodLabel(lat, lng)

  const ticker: TickerData = {
    spot_price_per_oz: burn.unit_cost_per_oz,
    spot_direction: 'down',
    avg_12pk: stash.price,
    avg_12pk_direction: 'up',
    fountain_spread_pct: Math.round(
      ((burn.unit_cost_per_oz - (1.75 / 12)) / (1.75 / 12)) * 100
    ),
  }

  return {
    burn,
    stash,
    ticker,
    location_label: label,
  }
}
