// ═══════════════════════════════════════════════════════════════════
// CLOUDFLARE WORKER: Kroger / King Soopers Live Pricing Proxy
// Edge proxy with OAuth token caching, CORS handling, and unit-cost parsing
// ═══════════════════════════════════════════════════════════════════

export interface Env {
  KROGER_CLIENT_ID?: string
  KROGER_CLIENT_SECRET?: string
}

interface KrogerLocation {
  locationId: string
  name?: string
  address?: {
    addressLine1?: string
    city?: string
    state?: string
    zipCode?: string
  }
  geolocation?: {
    latitude?: number
    longitude?: number
  }
}

interface KrogerProduct {
  description?: string
  items?: Array<{
    size?: string
    price?: {
      regular?: number
      promo?: number
    }
  }>
}

interface PackTier {
  format: '12pk' | '24pk' | 'costco'
  label: string
  store_name: string
  store_address: string
  pack_desc: string
  price: number
  formatted_price: string
  cans: number
  unit_cost_per_can: number
  caffeine_cost_per_mg: number
  vs_bodega_spread: number
  deal_badge: string | null
  distance_mi: number
  maps_url: string
  apple_maps_url: string
  google_maps_url: string
  is_best_unit_cost: boolean
  is_live_api: boolean
  min_units: number
  upfront_cost: number
  formatted_upfront: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

const MAX_KROGER_COVERAGE_MILES = 25
const BODEGA_SINGLE_CAN_PRICE = 1.75
const CAFFEINE_MG_PER_CAN = 46

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, max-age=300',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(0.1, Math.round(R * c * 10) / 10)
}

function isColoradoRequest(lat: number | null, lng: number | null, zip: string | null): boolean {
  if (zip) {
    const clean = zip.trim()
    if (!/^8[01]\d{3}(?:-\d{4})?$/.test(clean)) {
      return false
    }
  }
  if (lat !== null && lng !== null) {
    if (!(lat >= 36.9 && lat <= 41.1 && lng >= -109.1 && lng <= -102.0)) {
      return false
    }
  }
  return true
}

function buildMapUrls(query: string) {
  const encoded = encodeURIComponent(query)
  const google = `https://www.google.com/maps/search/?api=1&query=${encoded}`
  const apple = `https://maps.apple.com/?q=${encoded}&dirflg=d`
  return { maps_url: google, apple_maps_url: apple, google_maps_url: google }
}

function outsideRegionResponse(reason: string): Response {
  return jsonResponse({
    is_live_api: false,
    source: 'outside_kroger_region',
    coverage: false,
    error: reason,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
    }

    if (url.pathname === '/api/kroger/pricing' || url.pathname === '/') {
      const latParam = url.searchParams.get('lat')
      const lngParam = url.searchParams.get('lng')
      const zipParam = url.searchParams.get('zip')

      const parsedLat = latParam !== null ? parseFloat(latParam) : null
      const parsedLng = lngParam !== null ? parseFloat(lngParam) : null
      const hasValidCoords =
        parsedLat !== null &&
        parsedLng !== null &&
        Number.isFinite(parsedLat) &&
        Number.isFinite(parsedLng)

      const lat = hasValidCoords ? parsedLat : null
      const lng = hasValidCoords ? parsedLng : null
      const zip = zipParam ? zipParam.trim() : null

      // Default to Denver Capitol Hill only when caller provided neither coords nor zip
      const effectiveLat = lat ?? (zip ? null : 39.7392)
      const effectiveLng = lng ?? (zip ? null : -104.9847)
      const effectiveZip = zip ?? (hasValidCoords ? null : '80203')
      const inColorado = isColoradoRequest(effectiveLat, effectiveLng, effectiveZip)

      if (!inColorado) {
        return outsideRegionResponse(
          'Requested coordinates/ZIP are outside Colorado Kroger coverage.'
        )
      }

      try {
        if (env.KROGER_CLIENT_ID && env.KROGER_CLIENT_SECRET) {
          const token = await getKrogerToken(env.KROGER_CLIENT_ID, env.KROGER_CLIENT_SECRET)
          const location = await getNearestLocation(
            token,
            effectiveLat ?? undefined,
            effectiveLng ?? undefined,
            effectiveZip ?? undefined
          )

          if (!location) {
            return outsideRegionResponse(
              'No Kroger-banner location found within coverage for the requested coordinates or ZIP.'
            )
          }

          const locState = location.address?.state?.trim().toUpperCase()
          const locZip = location.address?.zipCode?.trim()
          const locLat = location.geolocation?.latitude
          const locLng = location.geolocation?.longitude

          if (
            (locState && locState !== 'CO') ||
            (locZip && !/^8[01]\d{3}(?:-\d{4})?$/.test(locZip)) ||
            (typeof locLat === 'number' &&
              typeof locLng === 'number' &&
              !(locLat >= 36.9 && locLat <= 41.1 && locLng >= -109.1 && locLng <= -102.0))
          ) {
            return outsideRegionResponse(
              'Returned Kroger location is outside Colorado coverage.'
            )
          }

          if (effectiveLat === null || effectiveLng === null) {
            if (
              locState !== 'CO' ||
              !locZip ||
              !/^8[01]\d{3}(?:-\d{4})?$/.test(locZip)
            ) {
              return outsideRegionResponse(
                'Returned Kroger location could not be verified within Colorado ZIP coverage.'
              )
            }
          }

          if (
            effectiveLat !== null &&
            effectiveLng !== null &&
            typeof locLat === 'number' &&
            typeof locLng === 'number'
          ) {
            const distance = haversineMiles(effectiveLat, effectiveLng, locLat, locLng)
            if (distance > MAX_KROGER_COVERAGE_MILES) {
              return outsideRegionResponse(
                `Nearest Kroger location is ${distance} mi away (exceeds ${MAX_KROGER_COVERAGE_MILES} mi coverage radius).`
              )
            }
          }

          const products = await getDietCokeProducts(token, location.locationId)
          const pricing = calculateBestPacks(
            products,
            location,
            effectiveLat ?? locLat ?? 39.7392,
            effectiveLng ?? locLng ?? -104.9847
          )

          if (pricing) {
            return jsonResponse(pricing)
          }
        }

        if (!inColorado) {
          return outsideRegionResponse(
            'Requested coordinates/ZIP are outside Colorado fallback coverage.'
          )
        }

        return jsonResponse(
          getDenverFallback(
            effectiveLat ?? 39.7392,
            effectiveLng ?? -104.9847,
            effectiveZip ?? '80203'
          )
        )
      } catch {
        if (!inColorado) {
          return outsideRegionResponse(
            'Live Kroger lookup failed and location is outside Colorado fallback coverage.'
          )
        }
        return jsonResponse(
          getDenverFallback(
            effectiveLat ?? 39.7392,
            effectiveLng ?? -104.9847,
            effectiveZip ?? '80203'
          )
        )
      }
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS })
  },
}

async function getKrogerToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token
  }

  const creds = btoa(`${clientId}:${clientSecret}`)
  const res = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!res.ok) {
    throw new Error(`Token fetch failed: ${res.statusText}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return data.access_token
}

async function getNearestLocation(
  token: string,
  lat?: number,
  lng?: number,
  zip?: string
): Promise<KrogerLocation | null> {
  let locationUrl = ''
  if (zip) {
    locationUrl = `https://api.kroger.com/v1/locations?filter.zipCode.near=${encodeURIComponent(zip)}&filter.radiusInMiles=${MAX_KROGER_COVERAGE_MILES}&filter.limit=1`
  } else if (lat !== undefined && lng !== undefined) {
    locationUrl = `https://api.kroger.com/v1/locations?filter.latLong.near=${lat},${lng}&filter.radiusInMiles=${MAX_KROGER_COVERAGE_MILES}&filter.limit=1`
  } else {
    return null
  }

  const res = await fetch(locationUrl, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })

  if (!res.ok) return null
  const data = (await res.json()) as { data?: KrogerLocation[] }
  return data.data?.[0] ?? null
}

async function getDietCokeProducts(token: string, locationId: string): Promise<KrogerProduct[]> {
  const url = `https://api.kroger.com/v1/products?filter.term=diet+coke&filter.locationId=${encodeURIComponent(locationId)}&filter.limit=20`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })

  if (!res.ok) return []
  const data = (await res.json()) as { data?: KrogerProduct[] }
  return data.data ?? []
}

function calculateBestPacks(
  products: KrogerProduct[],
  location: KrogerLocation,
  userLat: number,
  userLng: number
) {
  let pack12Best: { price: number; minUnits: number; isPromo: boolean } | null = null
  let pack24Best: { price: number; isPromo: boolean } | null = null

  for (const item of products) {
    const desc = (item.description || '').toLowerCase()
    const size = (item.items?.[0]?.size || '').toLowerCase()
    const priceData = item.items?.[0]?.price
    if (!priceData) continue

    const regular = typeof priceData.regular === 'number' && priceData.regular > 0 ? priceData.regular : null
    const promo = typeof priceData.promo === 'number' && priceData.promo > 0 ? priceData.promo : null
    const activePrice = promo ?? regular
    if (!activePrice || activePrice <= 0) continue

    const is12Pack =
      /\b12[\s-]*(pk|pack|ct|can|cans)\b/.test(desc) ||
      /\b12[\s-]*(pk|pack|ct|can|cans)\b/.test(size)
    const is24Pack =
      /\b24[\s-]*(pk|pack|ct|can|cans)\b/.test(desc) ||
      /\b24[\s-]*(pk|pack|ct|can|cans)\b/.test(size)

    if (is12Pack) {
      const isPromo = Boolean(promo && regular && promo < regular)
      if (!pack12Best || activePrice < pack12Best.price) {
        pack12Best = {
          price: activePrice,
          minUnits: isPromo && activePrice < 6 ? 5 : 1,
          isPromo,
        }
      }
    } else if (is24Pack) {
      const isPromo = Boolean(promo && regular && promo < regular)
      if (!pack24Best || activePrice < pack24Best.price) {
        pack24Best = {
          price: activePrice,
          isPromo,
        }
      }
    }
  }

  if (!pack12Best && !pack24Best) {
    return null
  }

  const baseName = location.name || 'Kroger'
  const storeName = `${baseName} (#${location.locationId || '0000'})`
  const storeAddress = `${location.address?.addressLine1 || ''}, ${location.address?.city || ''}, ${location.address?.state || ''} ${location.address?.zipCode || ''}`.replace(/^,\s*/, '').trim()
  const storeZip = location.address?.zipCode || ''
  const locLat = location.geolocation?.latitude
  const locLng = location.geolocation?.longitude
  const distance =
    typeof locLat === 'number' && typeof locLng === 'number'
      ? haversineMiles(userLat, userLng, locLat, locLng)
      : 1.0

  const storeMaps = buildMapUrls(`${storeName} ${storeAddress}`)
  const tiers: { pack12?: PackTier; pack24?: PackTier; costco?: PackTier } = {}

  if (pack12Best) {
    const unitCost = Math.round((pack12Best.price / 12) * 100) / 100
    const upfront = Math.round(pack12Best.price * pack12Best.minUnits * 100) / 100
    tiers.pack12 = {
      format: '12pk',
      label: '12-Pack',
      store_name: storeName,
      store_address: storeAddress,
      pack_desc: pack12Best.minUnits > 1 ? `12-Pack (Buy ${pack12Best.minUnits}+ Deal)` : '12-Pack Cans',
      price: pack12Best.price,
      formatted_price: `$${pack12Best.price.toFixed(2)}`,
      cans: 12,
      unit_cost_per_can: unitCost,
      caffeine_cost_per_mg: Math.round((unitCost / CAFFEINE_MG_PER_CAN) * 10000) / 10000,
      vs_bodega_spread: Math.round(((unitCost - BODEGA_SINGLE_CAN_PRICE) / BODEGA_SINGLE_CAN_PRICE) * 1000) / 10,
      deal_badge: pack12Best.isPromo
        ? `LIVE PROMO: $${pack12Best.price.toFixed(2)}/EA ($${unitCost.toFixed(2)}/CAN)`
        : null,
      distance_mi: distance,
      ...storeMaps,
      is_best_unit_cost: false,
      is_live_api: true,
      min_units: pack12Best.minUnits,
      upfront_cost: upfront,
      formatted_upfront:
        pack12Best.minUnits > 1
          ? `$${upfront.toFixed(2)} (${pack12Best.minUnits} pks req)`
          : `$${upfront.toFixed(2)} upfront`,
    }
  }

  if (pack24Best) {
    const unitCost = Math.round((pack24Best.price / 24) * 100) / 100
    tiers.pack24 = {
      format: '24pk',
      label: '24-Pack',
      store_name: `${baseName} (Single Case)`,
      store_address: storeAddress,
      pack_desc: '24-Pack Cans',
      price: pack24Best.price,
      formatted_price: `$${pack24Best.price.toFixed(2)}`,
      cans: 24,
      unit_cost_per_can: unitCost,
      caffeine_cost_per_mg: Math.round((unitCost / CAFFEINE_MG_PER_CAN) * 10000) / 10000,
      vs_bodega_spread: Math.round(((unitCost - BODEGA_SINGLE_CAN_PRICE) / BODEGA_SINGLE_CAN_PRICE) * 1000) / 10,
      deal_badge: pack24Best.isPromo
        ? `LIVE 24-PACK PROMO: $${pack24Best.price.toFixed(2)} ($${unitCost.toFixed(2)}/CAN)`
        : null,
      distance_mi: distance,
      ...storeMaps,
      is_best_unit_cost: false,
      is_live_api: true,
      min_units: 1,
      upfront_cost: pack24Best.price,
      formatted_upfront: `$${pack24Best.price.toFixed(2)} upfront`,
    }
  }

  // Scope Costco Denver Central benchmark strictly to Colorado locations
  if (location.address?.state === 'CO') {
    const costcoAddress = '400 S Zuni St, Denver, CO 80223'
    const costcoMaps = buildMapUrls(`Costco Wholesale ${costcoAddress}`)
    const costcoDist = haversineMiles(userLat, userLng, 39.7089, -105.0156)
    tiers.costco = {
      format: 'costco',
      label: 'Costco 36-Pk',
      store_name: 'Costco Wholesale (Denver Central)',
      store_address: costcoAddress,
      pack_desc: '36-Pack Flat',
      price: 17.49,
      formatted_price: '$17.49',
      cans: 36,
      unit_cost_per_can: 0.49,
      caffeine_cost_per_mg: Math.round((0.49 / CAFFEINE_MG_PER_CAN) * 10000) / 10000,
      vs_bodega_spread: Math.round(((0.49 - BODEGA_SINGLE_CAN_PRICE) / BODEGA_SINGLE_CAN_PRICE) * 1000) / 10,
      deal_badge: 'MEMBERS ONLY — CLUB BENCHMARK ($0.49/CAN)',
      distance_mi: costcoDist,
      ...costcoMaps,
      is_best_unit_cost: false,
      is_live_api: false,
      min_units: 1,
      upfront_cost: 17.49,
      formatted_upfront: '$17.49 (Club Flat)',
    }
  }

  const allTiers = [tiers.pack12, tiers.pack24, tiers.costco].filter((t): t is PackTier => Boolean(t))
  allTiers.sort((a, b) => {
    if (a.unit_cost_per_can !== b.unit_cost_per_can) {
      return a.unit_cost_per_can - b.unit_cost_per_can
    }
    return a.upfront_cost - b.upfront_cost
  })

  const winner = allTiers[0]
  const runner = allTiers.length > 1 ? allTiers[1] : null
  winner.is_best_unit_cost = true

  return {
    price: winner.price,
    formatted_price: winner.formatted_price,
    pack_desc: winner.pack_desc,
    cans: winner.cans,
    store_name: winner.store_name,
    store_address: winner.store_address,
    zip_code: storeZip,
    distance_mi: winner.distance_mi,
    deal_badge: winner.deal_badge,
    unit_cost_per_can: winner.unit_cost_per_can,
    caffeine_cost_per_mg: winner.caffeine_cost_per_mg,
    vs_bodega_spread: winner.vs_bodega_spread,
    maps_url: winner.maps_url,
    apple_maps_url: winner.apple_maps_url,
    google_maps_url: winner.google_maps_url,
    is_live_api: winner.is_live_api,
    source: 'kroger_live',
    coverage: true,
    min_units: winner.min_units,
    upfront_cost: winner.upfront_cost,
    formatted_upfront: winner.formatted_upfront,
    runner_up: runner
      ? {
          store_name: runner.store_name,
          deal_desc: `${runner.pack_desc} — ${runner.formatted_price} ($${runner.unit_cost_per_can.toFixed(2)}/can)`,
          price: runner.price,
        }
      : null,
    pack_tiers: tiers,
  }
}

function getDenverFallback(lat: number, lng: number, zip: string) {
  const ksAddress = '1155 E 9th Ave, Denver, CO 80218'
  const ksName = 'King Soopers (Capitol Hill) (#0029)'
  const ksDist = haversineMiles(lat, lng, 39.7308, -104.9735)
  const ksMaps = buildMapUrls(`${ksName} ${ksAddress}`)

  const costcoAddress = '400 S Zuni St, Denver, CO 80223'
  const costcoDist = haversineMiles(lat, lng, 39.7089, -105.0156)
  const costcoMaps = buildMapUrls(`Costco Wholesale ${costcoAddress}`)

  return {
    price: 4.99,
    formatted_price: '$4.99',
    pack_desc: '12-Pack (Buy 5+ Deal)',
    cans: 12,
    store_name: ksName,
    store_address: ksAddress,
    zip_code: zip.startsWith('80') || zip.startsWith('81') ? zip : '80218',
    distance_mi: ksDist,
    deal_badge: 'BUY 5+ MULTI-PACK PROMO: $4.99/EA • $24.95 UPFRONT ($0.42/CAN)',
    unit_cost_per_can: 0.42,
    caffeine_cost_per_mg: 0.0091,
    vs_bodega_spread: -76.0,
    ...ksMaps,
    is_live_api: false,
    source: 'fallback_directory',
    coverage: true,
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
        store_name: ksName,
        store_address: ksAddress,
        pack_desc: '12-Pack (Buy 5+ Deal)',
        price: 4.99,
        formatted_price: '$4.99',
        cans: 12,
        unit_cost_per_can: 0.42,
        caffeine_cost_per_mg: 0.0091,
        vs_bodega_spread: -76.0,
        deal_badge: 'BUY 5+ MULTI-PACK PROMO: $4.99/EA • $24.95 UPFRONT ($0.42/CAN)',
        distance_mi: ksDist,
        ...ksMaps,
        is_best_unit_cost: true,
        is_live_api: false,
        min_units: 5,
        upfront_cost: 24.95,
        formatted_upfront: '$24.95 (5 pks req)',
      },
      pack24: {
        format: '24pk',
        label: '24-Pack',
        store_name: 'King Soopers (Single Case)',
        store_address: ksAddress,
        pack_desc: '24-Pack Cans',
        price: 13.0,
        formatted_price: '$13.00',
        cans: 24,
        unit_cost_per_can: 0.54,
        caffeine_cost_per_mg: 0.0117,
        vs_bodega_spread: -69.1,
        deal_badge: 'SINGLE CASE SHELF PROMO: $13.00 ($0.54/CAN)',
        distance_mi: ksDist,
        ...ksMaps,
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
        store_address: costcoAddress,
        pack_desc: '36-Pack Flat',
        price: 17.49,
        formatted_price: '$17.49',
        cans: 36,
        unit_cost_per_can: 0.49,
        caffeine_cost_per_mg: 0.0106,
        vs_bodega_spread: -72.0,
        deal_badge: 'MEMBERS ONLY — CLUB BENCHMARK ($0.49/CAN)',
        distance_mi: costcoDist,
        ...costcoMaps,
        is_best_unit_cost: false,
        is_live_api: false,
        min_units: 1,
        upfront_cost: 17.49,
        formatted_upfront: '$17.49 (Club Flat)',
      },
    },
  }
}
