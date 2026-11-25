// ═══════════════════════════════════════════════════════════════════
// KROGER / KING SOOPERS LIVE PRICING & LOCAL DIRECTORY HYDRATION
// ═══════════════════════════════════════════════════════════════════

import { REFERENCE_CONSTANTS } from '@/data/store-matrix'
import type { BulkPackTier, StashResult } from '@/types'
import { getAppleMapsUrl, getGoogleMapsUrl, getDistanceMiles } from './geolocation'

const PROXY_URL =
  process.env.NEXT_PUBLIC_KROGER_PROXY_URL ||
  'https://fridgecig-kroger-proxy.robertyoushock.workers.dev'

export interface KingSoopersStoreInfo {
  storeNumber: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  servesZips: string[]
  lat: number
  lng: number
  phone: string
}

export const DENVER_KING_SOOPERS: KingSoopersStoreInfo[] = [
  {
    storeNumber: '0029',
    name: 'King Soopers (Capitol Hill)',
    address: '1155 E 9th Ave',
    city: 'Denver',
    state: 'CO',
    zip: '80218',
    servesZips: ['80203', '80218', '80202'],
    lat: 39.7308,
    lng: -104.9735,
    phone: '(303) 832-5280',
  },
  {
    storeNumber: '0039',
    name: 'King Soopers (Speer / Central)',
    address: '1331 Speer Blvd',
    city: 'Denver',
    state: 'CO',
    zip: '80204',
    servesZips: ['80204', '80205'],
    lat: 39.7368,
    lng: -104.9961,
    phone: '(303) 571-1188',
  },
  {
    storeNumber: '0048',
    name: 'King Soopers (Cherry Creek)',
    address: '2810 E 1st Ave',
    city: 'Denver',
    state: 'CO',
    zip: '80206',
    servesZips: ['80206', '80209'],
    lat: 39.7183,
    lng: -104.9542,
    phone: '(303) 322-7713',
  },
  {
    storeNumber: '0026',
    name: 'King Soopers (University / Wash Park)',
    address: '2177 S University Blvd',
    city: 'Denver',
    state: 'CO',
    zip: '80210',
    servesZips: ['80210', '80219'],
    lat: 39.6766,
    lng: -104.9592,
    phone: '(303) 777-6288',
  },
  {
    storeNumber: '0064',
    name: 'King Soopers (Monaco)',
    address: '890 S Monaco Pkwy',
    city: 'Denver',
    state: 'CO',
    zip: '80224',
    servesZips: ['80220', '80224'],
    lat: 39.7008,
    lng: -104.9126,
    phone: '(303) 333-5473',
  },
  {
    storeNumber: '0120',
    name: 'King Soopers (Wheat Ridge / West Denver)',
    address: '3400 Youngfield St',
    city: 'Wheat Ridge',
    state: 'CO',
    zip: '80033',
    servesZips: ['80211', '80212', '80033'],
    lat: 39.7645,
    lng: -105.1412,
    phone: '(303) 238-7351',
  },
  {
    storeNumber: '0012',
    name: 'King Soopers (Boulder)',
    address: '1650 30th St',
    city: 'Boulder',
    state: 'CO',
    zip: '80301',
    servesZips: ['80301', '80302', '80303'],
    lat: 40.0195,
    lng: -105.2536,
    phone: '(303) 443-9960',
  },
]

export function isColoradoLocation(lat: number, lng: number, zip?: string): boolean {
  if (zip) {
    const clean = zip.trim()
    if (clean.length >= 2) {
      return clean.startsWith('80') || clean.startsWith('81')
    }
  }
  return lat >= 36.9 && lat <= 41.1 && lng >= -109.1 && lng <= -102.0
}

function getExpectedState(lat: number, lng: number, zip?: string): string | null {
  if (zip) {
    const clean = zip.trim()
    if (clean.startsWith('80') || clean.startsWith('81')) return 'CO'
    if (clean.startsWith('10') || clean.startsWith('11')) return 'NY'
    if (clean.startsWith('606')) return 'IL'
    if (clean.startsWith('787')) return 'TX'
    if (clean.startsWith('900') || clean.startsWith('902')) return 'CA'
    if (clean.startsWith('981')) return 'WA'
    if (clean.startsWith('331')) return 'FL'
  }
  if (lat >= 36.9 && lat <= 41.1 && lng >= -109.1 && lng <= -102.0) return 'CO'
  if (lat >= 40.5 && lat <= 41.0 && lng >= -74.3 && lng <= -73.6) return 'NY'
  if (lat >= 41.6 && lat <= 42.1 && lng >= -88.0 && lng <= -87.4) return 'IL'
  if (lat >= 30.1 && lat <= 30.5 && lng >= -97.9 && lng <= -97.5) return 'TX'
  if (lat >= 33.7 && lat <= 34.4 && lng >= -118.7 && lng <= -118.0) return 'CA'
  if (lat >= 47.4 && lat <= 47.8 && lng >= -122.5 && lng <= -122.1) return 'WA'
  if (lat >= 25.5 && lat <= 26.0 && lng >= -80.4 && lng <= -80.0) return 'FL'
  return null
}

function extractStateCode(address?: string, zip?: string): string | null {
  if (address) {
    const match = address.match(/,\s*([A-Z]{2})(?:\s+\d{5})?\b/)
    if (match) return match[1]
  }
  if (zip) {
    if (zip.startsWith('80') || zip.startsWith('81')) return 'CO'
    if (zip.startsWith('10') || zip.startsWith('11')) return 'NY'
  }
  return null
}

export function normalizeWorkerPayload(raw: unknown): Partial<StashResult> | null {
  if (!raw || typeof raw !== 'object') return null
  const root = raw as Record<string, unknown>
  const candidate =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root

  if (root.data === null || candidate.coverage === false || candidate.source === 'outside_kroger_region') {
    return null
  }

  return candidate as Partial<StashResult>
}

export function isValidWorkerResponse(
  payload: Partial<StashResult> | null,
  targetLat: number,
  targetLng: number,
  targetZip?: string
): payload is Partial<StashResult> {
  if (!payload || typeof payload !== 'object') return false
  if (payload.coverage === false || payload.source === 'outside_kroger_region') return false
  if (typeof payload.distance_mi === 'number' && payload.distance_mi > 50) return false

  const expectedState = getExpectedState(targetLat, targetLng, targetZip)
  const responseState = extractStateCode(payload.store_address, payload.zip_code)
  if (expectedState && responseState && responseState !== expectedState) {
    return false
  }

  if (
    !isColoradoLocation(targetLat, targetLng, targetZip) &&
    payload.store_name?.toLowerCase().includes('king soopers')
  ) {
    return false
  }

  return true
}

export function findLocalKingSoopers(lat: number, lng: number, zip?: string): KingSoopersStoreInfo {
  if (zip) {
    const direct = DENVER_KING_SOOPERS.find(
      (s) => s.zip === zip || (s.servesZips && s.servesZips.includes(zip))
    )
    if (direct) return direct
    const prefix = DENVER_KING_SOOPERS.find((s) => s.zip.slice(0, 3) === zip.slice(0, 3))
    if (prefix) return prefix
  }

  let closest = DENVER_KING_SOOPERS[0]
  let min = Infinity

  for (const store of DENVER_KING_SOOPERS) {
    const d = getDistanceMiles(lat, lng, store.lat, store.lng)
    if (d < min) {
      min = d
      closest = store
    }
  }

  return closest
}

function buildConsistentTier(
  baseTier: BulkPackTier | undefined,
  liveTier: Partial<BulkPackTier> | undefined,
  format: '12pk' | '24pk' | 'costco',
  isGenuineLive: boolean,
  fallbackDistance?: number
): BulkPackTier | undefined {
  if (!baseTier && !liveTier) return undefined

  const merged = { ...(baseTier ?? {}), ...(liveTier ?? {}) } as BulkPackTier
  const cans =
    typeof merged.cans === 'number' && merged.cans > 0
      ? merged.cans
      : format === '12pk'
        ? 12
        : format === '24pk'
          ? 24
          : 36
  const price =
    typeof merged.price === 'number' && Number.isFinite(merged.price) && merged.price > 0
      ? merged.price
      : baseTier?.price ?? 0
  if (price <= 0) return undefined

  const minUnits =
    typeof liveTier?.min_units === 'number' && liveTier.min_units >= 1
      ? liveTier.min_units
      : liveTier?.price !== undefined
        ? 1
        : baseTier?.min_units ?? 1

  const defaultPackDesc =
    format === '12pk'
      ? minUnits > 1
        ? `12-Pack (Buy ${minUnits}+ Deal)`
        : '12-Pack Cans'
      : format === '24pk'
        ? minUnits > 1
          ? `24-Pack (Buy ${minUnits}+ Deal)`
          : '24-Pack Cans'
        : '36-Pack Flat'

  let packDesc = liveTier?.pack_desc || baseTier?.pack_desc || defaultPackDesc
  if (
    !liveTier?.pack_desc &&
    liveTier &&
    (liveTier.price !== undefined || liveTier.min_units !== undefined)
  ) {
    if (
      minUnits === 1 ||
      (baseTier?.min_units !== undefined && minUnits !== baseTier.min_units)
    ) {
      packDesc = defaultPackDesc
    }
  }

  const upfrontCost =
    typeof liveTier?.upfront_cost === 'number' && Number.isFinite(liveTier.upfront_cost)
      ? liveTier.upfront_cost
      : Math.round(price * minUnits * 100) / 100

  const formattedUpfront =
    liveTier?.formatted_upfront ??
    (minUnits > 1
      ? `$${upfrontCost.toFixed(2)} (${minUnits} pks req)`
      : format === 'costco'
        ? `$${upfrontCost.toFixed(2)} (Club Flat)`
        : `$${upfrontCost.toFixed(2)} upfront`)

  const unitCost = Math.round((price / cans) * 100) / 100
  const caffeineCost = Math.round((unitCost / REFERENCE_CONSTANTS.CAFFEINE_MG_PER_12OZ) * 10000) / 10000
  const computedVsBodega =
    Math.round(
      ((unitCost - REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) /
        REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) *
        1000
    ) / 10
  const vsBodega =
    typeof liveTier?.vs_bodega_spread === 'number'
      ? liveTier.vs_bodega_spread
      : liveTier?.price !== undefined
        ? computedVsBodega
        : baseTier?.vs_bodega_spread ?? computedVsBodega

  const distance =
    typeof liveTier?.distance_mi === 'number' && liveTier.distance_mi > 0
      ? liveTier.distance_mi
      : liveTier && typeof fallbackDistance === 'number' && fallbackDistance > 0
        ? fallbackDistance
        : baseTier?.distance_mi ?? 1.0

  const mapsUrl = liveTier?.maps_url || liveTier?.google_maps_url || baseTier?.maps_url || ''
  const appleMapsUrl = liveTier?.apple_maps_url || baseTier?.apple_maps_url || mapsUrl
  const googleMapsUrl = liveTier?.google_maps_url || baseTier?.google_maps_url || mapsUrl

  let dealBadge: string | null | undefined = liveTier?.deal_badge
  if (dealBadge === undefined) {
    if (
      liveTier !== undefined &&
      (minUnits !== (baseTier?.min_units ?? 1) ||
        (liveTier.price !== undefined &&
          Math.abs(price - (baseTier?.price ?? 0)) > 0.001))
    ) {
      dealBadge = null
    } else {
      dealBadge = baseTier?.deal_badge ?? null
    }
  }

  return {
    ...merged,
    format,
    label:
      merged.label ||
      (format === '12pk' ? '12-Pack' : format === '24pk' ? '24-Pack' : 'Costco 36-Pk'),
    store_name:
      merged.store_name ||
      (format === 'costco' ? 'Costco Wholesale' : 'King Soopers'),
    pack_desc: packDesc,
    cans,
    price,
    formatted_price: `$${price.toFixed(2)}`,
    min_units: minUnits,
    upfront_cost: upfrontCost,
    formatted_upfront: formattedUpfront,
    unit_cost_per_can: unitCost,
    caffeine_cost_per_mg: caffeineCost,
    vs_bodega_spread: vsBodega,
    deal_badge: dealBadge,
    distance_mi: distance,
    maps_url: mapsUrl,
    apple_maps_url: appleMapsUrl,
    google_maps_url: googleMapsUrl,
    is_live_api: Boolean(liveTier) && isGenuineLive && Boolean(liveTier?.is_live_api ?? true),
    is_best_unit_cost: false,
  }
}

/**
 * Normalize and safely merge live Worker / directory stash data into the baseline StashResult.
 * Prevents shallow-merge field mismatches (e.g. 24-Pack price paired with 12-Pack upfront outlay).
 */
export function mergeLiveStash(
  base: StashResult,
  live: Partial<StashResult> | null | undefined
): StashResult {
  if (!live || typeof live !== 'object') return base
  if (live.coverage === false || live.source === 'outside_kroger_region') return base

  const baseState = extractStateCode(base.store_address, base.zip_code)
  const liveState = extractStateCode(live.store_address, live.zip_code)
  if (baseState && liveState && baseState !== liveState) return base
  if (typeof live.distance_mi === 'number' && live.distance_mi > 50) return base

  const isGenuineLive =
    live.is_live_api === true &&
    live.source !== 'fallback_directory' &&
    live.source !== 'local_directory'

  const hasLivePackTiers = Boolean(
    live.pack_tiers &&
      (live.pack_tiers.pack12 || live.pack_tiers.pack24 || live.pack_tiers.costco)
  )

  let effectiveLivePackTiers: {
    pack12?: Partial<BulkPackTier>
    pack24?: Partial<BulkPackTier>
    costco?: Partial<BulkPackTier>
  } = (live.pack_tiers as {
    pack12?: Partial<BulkPackTier>
    pack24?: Partial<BulkPackTier>
    costco?: Partial<BulkPackTier>
  } | undefined) ?? {}

  if (
    !hasLivePackTiers &&
    typeof live.price === 'number' &&
    Number.isFinite(live.price) &&
    live.price > 0
  ) {
    const descLower = (live.pack_desc ?? '').toLowerCase()
    const is36Pack =
      live.cans === 36 ||
      /\b36[\s-]*(pk|pack|ct|can|cans)\b/.test(descLower) ||
      (live.store_name?.toLowerCase().includes('costco') ?? false)
    const is24Pack =
      !is36Pack &&
      (live.cans === 24 || /\b24[\s-]*(pk|pack|ct|can|cans)\b/.test(descLower))

    const syntheticTier: Partial<BulkPackTier> = {
      ...(live.store_name !== undefined ? { store_name: live.store_name } : {}),
      ...(live.store_address !== undefined ? { store_address: live.store_address } : {}),
      ...(live.pack_desc !== undefined ? { pack_desc: live.pack_desc } : {}),
      ...(live.cans !== undefined ? { cans: live.cans } : {}),
      price: live.price,
      ...(live.formatted_price !== undefined ? { formatted_price: live.formatted_price } : {}),
      ...(live.min_units !== undefined ? { min_units: live.min_units } : {}),
      ...(live.upfront_cost !== undefined ? { upfront_cost: live.upfront_cost } : {}),
      ...(live.formatted_upfront !== undefined ? { formatted_upfront: live.formatted_upfront } : {}),
      ...(live.deal_badge !== undefined ? { deal_badge: live.deal_badge } : {}),
      ...(live.distance_mi !== undefined ? { distance_mi: live.distance_mi } : {}),
      ...(live.maps_url !== undefined ? { maps_url: live.maps_url } : {}),
      ...(live.apple_maps_url !== undefined ? { apple_maps_url: live.apple_maps_url } : {}),
      ...(live.google_maps_url !== undefined ? { google_maps_url: live.google_maps_url } : {}),
      ...(live.vs_bodega_spread !== undefined ? { vs_bodega_spread: live.vs_bodega_spread } : {}),
      is_live_api: isGenuineLive,
    }

    effectiveLivePackTiers = is36Pack
      ? { costco: syntheticTier }
      : is24Pack
        ? { pack24: syntheticTier }
        : { pack12: syntheticTier }
  }

  const hasPackTiers = Boolean(
    base.pack_tiers ||
      effectiveLivePackTiers.pack12 ||
      effectiveLivePackTiers.pack24 ||
      effectiveLivePackTiers.costco
  )

  if (hasPackTiers) {
    const liveTopDistance =
      typeof live.distance_mi === 'number' && live.distance_mi > 0 ? live.distance_mi : undefined
    const pack12 = buildConsistentTier(
      base.pack_tiers?.pack12,
      effectiveLivePackTiers.pack12,
      '12pk',
      isGenuineLive,
      liveTopDistance
    )
    const pack24 = buildConsistentTier(
      base.pack_tiers?.pack24,
      effectiveLivePackTiers.pack24,
      '24pk',
      isGenuineLive,
      liveTopDistance
    )
    const costco = buildConsistentTier(
      base.pack_tiers?.costco,
      effectiveLivePackTiers.costco,
      'costco',
      isGenuineLive && Boolean(effectiveLivePackTiers.costco?.is_live_api)
    )

    const available = [pack12, pack24, costco].filter((t): t is BulkPackTier => Boolean(t))

    if (available.length > 0) {
      available.sort((a, b) => {
        if (a.unit_cost_per_can !== b.unit_cost_per_can) {
          return a.unit_cost_per_can - b.unit_cost_per_can
        }
        return (a.upfront_cost ?? a.price) - (b.upfront_cost ?? b.price)
      })

      const winner = available[0]
      const second = available.length > 1 ? available[1] : null

      for (const tier of available) {
        tier.is_best_unit_cost = tier === winner
      }

      const winningRunnerUp =
        live.runner_up !== undefined
          ? live.runner_up
          : second
            ? {
                store_name: second.store_name,
                deal_desc: `${second.pack_desc} — ${second.formatted_price} ($${second.unit_cost_per_can.toFixed(2)}/can)`,
                price: second.price,
              }
            : base.runner_up

      return {
        ...base,
        price: winner.price,
        formatted_price: winner.formatted_price,
        pack_desc: winner.pack_desc,
        cans: winner.cans,
        store_name: winner.store_name,
        store_address: winner.store_address ?? live.store_address ?? base.store_address,
        zip_code: live.zip_code ?? base.zip_code,
        distance_mi: winner.distance_mi,
        deal_badge: winner.deal_badge ?? null,
        unit_cost_per_can: winner.unit_cost_per_can,
        caffeine_cost_per_mg: winner.caffeine_cost_per_mg,
        vs_bodega_spread: winner.vs_bodega_spread,
        maps_url: winner.maps_url,
        apple_maps_url: winner.apple_maps_url ?? winner.maps_url,
        google_maps_url: winner.google_maps_url ?? winner.maps_url,
        min_units: winner.min_units ?? 1,
        upfront_cost: winner.upfront_cost ?? winner.price,
        formatted_upfront: winner.formatted_upfront ?? `$${winner.price.toFixed(2)} upfront`,
        is_live_api: Boolean(isGenuineLive && winner.is_live_api),
        source: live.source ?? (isGenuineLive ? 'kroger_live' : 'local_directory'),
        coverage: live.coverage ?? true,
        last_updated: live.last_updated ?? base.last_updated,
        runner_up: winningRunnerUp,
        pack_tiers: {
          pack12,
          pack24,
          costco,
        },
      }
    }
  }

  // Fallback when no pack_tiers are present on either side
  const price = typeof live.price === 'number' && live.price > 0 ? live.price : base.price
  const cans = typeof live.cans === 'number' && live.cans > 0 ? live.cans : base.cans ?? 12
  const minUnits =
    typeof live.min_units === 'number' && live.min_units >= 1
      ? live.min_units
      : live.price !== undefined
        ? 1
        : base.min_units ?? 1
  const upfrontCost =
    typeof live.upfront_cost === 'number'
      ? live.upfront_cost
      : Math.round(price * minUnits * 100) / 100
  const unitCost =
    typeof live.unit_cost_per_can === 'number'
      ? live.unit_cost_per_can
      : Math.round((price / cans) * 100) / 100
  const computedVsBodega =
    Math.round(
      ((unitCost - REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) /
        REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) *
        1000
    ) / 10
  const vsBodega =
    typeof live.vs_bodega_spread === 'number'
      ? live.vs_bodega_spread
      : live.price !== undefined
        ? computedVsBodega
        : base.vs_bodega_spread ?? computedVsBodega
  let dealBadge: string | null | undefined = live.deal_badge
  if (dealBadge === undefined) {
    if (
      minUnits !== (base.min_units ?? 1) ||
      (live.price !== undefined && Math.abs(price - base.price) > 0.001)
    ) {
      dealBadge = null
    } else {
      dealBadge = base.deal_badge ?? null
    }
  }

  return {
    ...base,
    ...live,
    price,
    formatted_price: live.formatted_price ?? `$${price.toFixed(2)}`,
    cans,
    min_units: minUnits,
    upfront_cost: upfrontCost,
    formatted_upfront:
      live.formatted_upfront ??
      (minUnits > 1
        ? `$${upfrontCost.toFixed(2)} (${minUnits} pks req)`
        : `$${upfrontCost.toFixed(2)} upfront`),
    unit_cost_per_can: unitCost,
    caffeine_cost_per_mg:
      live.caffeine_cost_per_mg ??
      Math.round((unitCost / REFERENCE_CONSTANTS.CAFFEINE_MG_PER_12OZ) * 10000) / 10000,
    vs_bodega_spread: vsBodega,
    deal_badge: dealBadge,
    is_live_api: isGenuineLive,
    source: live.source ?? (isGenuineLive ? 'kroger_live' : 'local_directory'),
  }
}

/**
 * Fetch live shelf pricing from the Cloudflare Worker proxy for supported Colorado/King Soopers locations.
 * Returns null immediately for out-of-region cities (e.g. NYC/Chicago/etc.) so Denver fallback can never bleed through.
 */
export async function fetchLiveKrogerPricing(
  lat: number,
  lng: number,
  zip?: string
): Promise<Partial<StashResult> | null> {
  const isColorado = isColoradoLocation(lat, lng, zip)
  if (!isColorado) {
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2800)

    const params = new URLSearchParams()
    if (lat && lng) {
      params.set('lat', lat.toString())
      params.set('lng', lng.toString())
    }
    if (zip) params.set('zip', zip)

    const res = await fetch(`${PROXY_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    clearTimeout(timeoutId)

    if (res.ok) {
      const json: unknown = await res.json()
      const payload = normalizeWorkerPayload(json)
      if (isValidWorkerResponse(payload, lat, lng, zip)) {
        const isGenuineLive =
          payload.is_live_api === true &&
          payload.source !== 'fallback_directory' &&
          payload.coverage !== false
        const sanitizedPackTiers = payload.pack_tiers
          ? {
              ...(payload.pack_tiers.pack12
                ? {
                    pack12: {
                      ...payload.pack_tiers.pack12,
                      is_live_api:
                        isGenuineLive && Boolean(payload.pack_tiers.pack12.is_live_api ?? true),
                    },
                  }
                : {}),
              ...(payload.pack_tiers.pack24
                ? {
                    pack24: {
                      ...payload.pack_tiers.pack24,
                      is_live_api:
                        isGenuineLive && Boolean(payload.pack_tiers.pack24.is_live_api ?? true),
                    },
                  }
                : {}),
              ...(payload.pack_tiers.costco
                ? {
                    costco: {
                      ...payload.pack_tiers.costco,
                      is_live_api:
                        isGenuineLive && Boolean(payload.pack_tiers.costco.is_live_api ?? false),
                    },
                  }
                : {}),
            }
          : undefined
        return {
          ...payload,
          ...(sanitizedPackTiers ? { pack_tiers: sanitizedPackTiers } : {}),
          is_live_api: isGenuineLive,
          source: payload.source ?? (isGenuineLive ? 'kroger_live' : 'fallback_directory'),
        }
      }
    }
  } catch {
    // Network / timeout error: proceed to local directory fallback
  }

  // In Colorado / Denver, synthesize verified King Soopers store data by zip (truthfully marked non-live)
  const store = findLocalKingSoopers(lat, lng, zip)
  const distance = Math.max(0.1, getDistanceMiles(lat, lng, store.lat, store.lng))
  const price = 4.99
  const unitCost = 0.42
  const caffeineCost = Math.round((unitCost / REFERENCE_CONSTANTS.CAFFEINE_MG_PER_12OZ) * 10000) / 10000
  const spread =
    Math.round(
      ((unitCost - REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) /
        REFERENCE_CONSTANTS.BODEGA_SINGLE_CAN_PRICE) *
        1000
    ) / 10
  const storeName = `${store.name} (#${store.storeNumber})`
  const address = `${store.address}, ${store.city}, ${store.state} ${store.zip}`
  const query = `${storeName} ${address}`
  const costcoDist = Math.max(0.1, getDistanceMiles(lat, lng, 39.7089, -105.0156))

  return {
    store_name: storeName,
    store_address: address,
    zip_code: store.zip,
    pack_desc: '12-Pack (Buy 5+ Deal)',
    cans: 12,
    price,
    formatted_price: `$${price.toFixed(2)}`,
    unit_cost_per_can: unitCost,
    caffeine_cost_per_mg: caffeineCost,
    vs_bodega_spread: spread,
    deal_badge: 'BUY 5+ MULTI-PACK PROMO: $4.99/EA • $24.95 UPFRONT ($0.42/CAN)',
    min_units: 5,
    upfront_cost: 24.95,
    formatted_upfront: '$24.95 (5 pks req)',
    runner_up: {
      store_name: 'Costco Wholesale (Denver Central)',
      deal_desc: '36-Pack Flat — $17.49 ($0.49/can)',
      price: 17.49,
    },
    pack_tiers: {
      pack12: {
        format: '12pk',
        label: '12-Pack',
        store_name: storeName,
        store_address: address,
        pack_desc: '12-Pack (Buy 5+ Deal)',
        price: 4.99,
        formatted_price: '$4.99',
        cans: 12,
        unit_cost_per_can: 0.42,
        caffeine_cost_per_mg: caffeineCost,
        vs_bodega_spread: spread,
        deal_badge: 'BUY 5+ MULTI-PACK PROMO: $4.99/EA • $24.95 UPFRONT ($0.42/CAN)',
        distance_mi: distance,
        maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
        apple_maps_url: getAppleMapsUrl(query, lat, lng, 'driving'),
        google_maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
        is_best_unit_cost: true,
        is_live_api: false,
        min_units: 5,
        upfront_cost: 24.95,
        formatted_upfront: '$24.95 (5 pks req)',
      },
      pack24: {
        format: '24pk',
        label: '24-Pack',
        store_name: `${store.name} (Single Case)`,
        store_address: address,
        pack_desc: '24-Pack Cans',
        price: 13.0,
        formatted_price: '$13.00',
        cans: 24,
        unit_cost_per_can: 0.54,
        caffeine_cost_per_mg: Math.round((0.54 / 46) * 10000) / 10000,
        vs_bodega_spread: Math.round(((0.54 - 1.75) / 1.75) * 1000) / 10,
        deal_badge: 'SINGLE CASE SHELF PROMO: $13.00 ($0.54/CAN)',
        distance_mi: distance,
        maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
        apple_maps_url: getAppleMapsUrl(query, lat, lng, 'driving'),
        google_maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
        is_best_unit_cost: false,
        is_live_api: false,
        min_units: 1,
        upfront_cost: 13.0,
        formatted_upfront: '$13.00 upfront',
      },
      costco: {
        format: 'costco',
        label: 'Costco 36-Pk',
        store_name: 'Costco Wholesale (Denver Central)',
        store_address: '400 S Zuni St, Denver, CO 80223',
        pack_desc: '36-Pack Flat',
        price: 17.49,
        formatted_price: '$17.49',
        cans: 36,
        unit_cost_per_can: 0.49,
        caffeine_cost_per_mg: Math.round((0.49 / 46) * 10000) / 10000,
        vs_bodega_spread: Math.round(((0.49 - 1.75) / 1.75) * 1000) / 10,
        deal_badge: 'MEMBERS ONLY — CLUB BENCHMARK ($0.49/CAN)',
        distance_mi: costcoDist,
        maps_url: getGoogleMapsUrl('Costco Wholesale 400 S Zuni St, Denver, CO 80223', lat, lng, 'driving'),
        apple_maps_url: getAppleMapsUrl('Costco Wholesale 400 S Zuni St, Denver, CO 80223', lat, lng, 'driving'),
        google_maps_url: getGoogleMapsUrl('Costco Wholesale 400 S Zuni St, Denver, CO 80223', lat, lng, 'driving'),
        is_best_unit_cost: false,
        is_live_api: false,
        min_units: 1,
        upfront_cost: 17.49,
        formatted_upfront: '$17.49 (Club Flat)',
      },
    },
    distance_mi: distance,
    apple_maps_url: getAppleMapsUrl(query, lat, lng, 'driving'),
    google_maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
    maps_url: getGoogleMapsUrl(query, lat, lng, 'driving'),
    is_live_api: false,
    source: 'local_directory',
    coverage: true,
    last_updated: new Date().toISOString(),
  }
}
