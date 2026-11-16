// ═══════════════════════════════════════════════════════════════════
// STORE MATRIX — The Diet Coke Index Pricing Knowledge Base
// Curated chain pricing, bulk deals, and reference constants.
// ═══════════════════════════════════════════════════════════════════

export interface SizeEntry {
  size: string
  price: number
  oz: number
}

export interface StoreEntry {
  name: string
  sizes: SizeEntry[]
  type: 'mcdonalds' | 'gas_station' | 'convenience' | 'fast_food'
}

export interface BulkDeal {
  store: string
  pack_desc: string
  price: number
  cans: number
  oz_per_can: number
  deal_badge: string | null
  deal_desc?: string
  effective_per_can?: number
  regions: string[]
  distance_mi: number
  store_address?: string
  min_units?: number
  upfront_cost?: number
}

// ---------------------------------------------------------------------------
// 1. SINGLE-SERVE MATRIX
// ---------------------------------------------------------------------------

export const SINGLE_SERVE_MATRIX: Record<string, StoreEntry> = {
  'mcdonalds': {
    name: "McDonald's",
    sizes: [
      { size: 'Small (16oz)', price: 1.29, oz: 16 },
      { size: 'Medium (21oz)', price: 1.49, oz: 21 },
      { size: 'Large (30oz)', price: 1.49, oz: 30 },
    ],
    type: 'mcdonalds',
  },
  'circle-k': {
    name: 'Circle K',
    sizes: [
      { size: '32oz Polar Pop', price: 0.99, oz: 32 },
      { size: '44oz Polar Pop', price: 1.19, oz: 44 },
      { size: '20oz Bottle', price: 2.49, oz: 20 },
    ],
    type: 'gas_station',
  },
  '7-eleven': {
    name: '7-Eleven',
    sizes: [
      { size: '32oz Big Gulp', price: 1.19, oz: 32 },
      { size: '44oz Super Big Gulp', price: 1.49, oz: 44 },
      { size: '20oz Bottle', price: 2.69, oz: 20 },
    ],
    type: 'convenience',
  },
  'wendys': {
    name: "Wendy's",
    sizes: [
      { size: 'Small (20oz)', price: 2.19, oz: 20 },
      { size: 'Medium (32oz)', price: 2.59, oz: 32 },
      { size: 'Large (42oz)', price: 2.89, oz: 42 },
    ],
    type: 'fast_food',
  },
  'subway': {
    name: 'Subway',
    sizes: [
      { size: '20oz Fountain', price: 2.29, oz: 20 },
      { size: '30oz Fountain', price: 2.69, oz: 30 },
      { size: '20oz Bottle', price: 2.89, oz: 20 },
    ],
    type: 'fast_food',
  },
  'conoco': {
    name: 'Conoco',
    sizes: [
      { size: '20oz Bottle', price: 2.79, oz: 20 },
    ],
    type: 'gas_station',
  },
  'kum-and-go': {
    name: 'Kum & Go',
    sizes: [
      { size: '32oz Fountain', price: 1.29, oz: 32 },
    ],
    type: 'gas_station',
  },
  'wawa': {
    name: 'Wawa',
    sizes: [
      { size: '24oz Fountain', price: 1.29, oz: 24 },
    ],
    type: 'convenience',
  },
  'sheetz': {
    name: 'Sheetz',
    sizes: [
      { size: '32oz Fountain', price: 1.49, oz: 32 },
    ],
    type: 'convenience',
  },
  'racetrac': {
    name: 'RaceTrac',
    sizes: [
      { size: '32oz Fountain', price: 1.09, oz: 32 },
    ],
    type: 'gas_station',
  },
  'bodega': {
    name: 'Bodega / Corner Store',
    sizes: [
      { size: '20oz Bottle', price: 2.99, oz: 20 },
      { size: '12oz Can', price: 1.75, oz: 12 },
    ],
    type: 'convenience',
  },
}

// ---------------------------------------------------------------------------
// 2. BULK DEALS ACROSS REGIONAL METRO HUBS
// ---------------------------------------------------------------------------

export const BULK_DEALS: BulkDeal[] = [
  // ── Denver / Colorado ──
  {
    store: 'King Soopers (Capitol Hill)',
    pack_desc: '12-Pack (Buy 5+ Deal)',
    price: 4.99,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '🔥 BUY 5+ MULTI-PACK PROMO: $4.99/EA ($0.42/CAN)',
    deal_desc: 'Must buy 5 or more (60 cans = $24.95)',
    effective_per_can: 0.42,
    min_units: 5,
    upfront_cost: 24.95,
    regions: ['denver', 'colorado'],
    distance_mi: 1.1,
    store_address: '1155 E 9th Ave, Denver, CO 80218',
  },
  {
    store: 'King Soopers (Single Case)',
    pack_desc: '24-Pack Cans',
    price: 13.00,
    cans: 24,
    oz_per_can: 12,
    deal_badge: '🔥 SINGLE CASE PROMO ($0.54/can)',
    deal_desc: 'Weekly Shelf Promo ($13.00 / 24pk)',
    effective_per_can: 0.54,
    min_units: 1,
    upfront_cost: 13.00,
    regions: ['denver', 'colorado'],
    distance_mi: 1.1,
    store_address: '1155 E 9th Ave, Denver, CO 80218',
  },
  {
    store: 'Costco Wholesale (Denver Central)',
    pack_desc: '36-Pack Cans',
    price: 17.49,
    cans: 36,
    oz_per_can: 12,
    deal_badge: '🏪 MEMBERS ONLY — CLUB BENCHMARK ($0.49/can)',
    deal_desc: 'Costco Wholesale 36-Can Flat ($17.49 upfront)',
    effective_per_can: 0.49,
    min_units: 1,
    upfront_cost: 17.49,
    regions: ['denver', 'colorado'],
    distance_mi: 3.8,
    store_address: '400 S Zuni St, Denver, CO 80223',
  },
  {
    store: 'Safeway',
    pack_desc: '12-Pack Cans',
    price: 6.99,
    cans: 12,
    oz_per_can: 12,
    deal_badge: null,
    deal_desc: 'Member Price',
    effective_per_can: 0.58,
    min_units: 1,
    upfront_cost: 6.99,
    regions: ['denver', 'colorado'],
    distance_mi: 0.8,
    store_address: '2150 E Evans Ave, Denver, CO 80210',
  },

  // ── Manhattan / New York Metro ──
  {
    store: 'Costco Wholesale (East Harlem)',
    pack_desc: '36-Pack Cans',
    price: 16.99,
    cans: 36,
    oz_per_can: 12,
    deal_badge: '🏪 MANHATTAN BULK ALPHA ($0.47/can)',
    deal_desc: 'Manhattan Island Bulk Wholesale',
    effective_per_can: 0.47,
    min_units: 1,
    upfront_cost: 16.99,
    regions: ['manhattan', 'nyc', 'new-york'],
    distance_mi: 2.8,
    store_address: '517 E 117th St, New York, NY 10035',
  },
  {
    store: 'Target (Herald Square)',
    pack_desc: '12-Pack Cans',
    price: 5.99,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '🍎 NYC CIRCLE REBATE: 3 FOR $18 ($0.50/can)',
    deal_desc: '3 for $18 with Target Circle',
    effective_per_can: 0.50,
    min_units: 3,
    upfront_cost: 17.97,
    regions: ['manhattan', 'nyc', 'new-york'],
    distance_mi: 0.6,
    store_address: '112 W 34th St, New York, NY 10001',
  },

  // ── Chicago ──
  {
    store: 'Jewel-Osco (Lincoln Park)',
    pack_desc: '24-Pack Cans',
    price: 11.99,
    cans: 24,
    oz_per_can: 12,
    deal_badge: '🔥 JEWEL JUST FOR U: $11.99 ($0.50/can)',
    deal_desc: 'Just For U Digital Coupon',
    effective_per_can: 0.50,
    min_units: 1,
    upfront_cost: 11.99,
    regions: ['chicago'],
    distance_mi: 1.4,
    store_address: '2550 N Clybourn Ave, Chicago, IL 60614',
  },
  {
    store: 'Mariano’s (New Eastside)',
    pack_desc: '12-Pack Cans',
    price: 4.99,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '🔥 BUY 5+ MULTI-PACK PROMO ($0.42/can)',
    deal_desc: 'Must buy 5 or more (60 cans = $24.95)',
    effective_per_can: 0.42,
    min_units: 5,
    upfront_cost: 24.95,
    regions: ['chicago'],
    distance_mi: 0.9,
    store_address: '333 E Benton Pl, Chicago, IL 60601',
  },

  // ── Los Angeles ──
  {
    store: 'Ralphs (Silver Lake)',
    pack_desc: '12-Pack Cans',
    price: 4.99,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '🌴 SOCAL RALPHS CLUB PROMO ($0.42/can)',
    deal_desc: 'Buy 5 or More Savings',
    effective_per_can: 0.42,
    min_units: 5,
    upfront_cost: 24.95,
    regions: ['los-angeles', 'la', 'california'],
    distance_mi: 1.2,
    store_address: '7257 Sunset Blvd, West Hollywood, CA 90046',
  },
  {
    store: 'Ralphs (Single Case)',
    pack_desc: '24-Pack Cans',
    price: 13.49,
    cans: 24,
    oz_per_can: 12,
    deal_badge: '🔥 SINGLE CASE PROMO ($0.56/can)',
    deal_desc: 'Weekly Shelf Promo',
    effective_per_can: 0.56,
    min_units: 1,
    upfront_cost: 13.49,
    regions: ['los-angeles', 'la', 'california'],
    distance_mi: 1.2,
    store_address: '7257 Sunset Blvd, West Hollywood, CA 90046',
  },

  // ── Austin ──
  {
    store: 'H-E-B (East 7th)',
    pack_desc: '12-Pack Cans',
    price: 4.78,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '🤠 HEB LONE STAR PROMO ($0.40/can)',
    deal_desc: 'Combo Loco Multi-Buy',
    effective_per_can: 0.40,
    min_units: 4,
    upfront_cost: 19.12,
    regions: ['austin', 'texas'],
    distance_mi: 1.5,
    store_address: '2701 E 7th St, Austin, TX 78702',
  },

  // ── Seattle ──
  {
    store: 'QFC (Capitol Hill)',
    pack_desc: '12-Pack Cans',
    price: 4.99,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '🌲 PACNW ADVANTAGE CARD PROMO ($0.42/can)',
    deal_desc: 'Buy 5 or more Mix & Match',
    effective_per_can: 0.42,
    min_units: 5,
    upfront_cost: 24.95,
    regions: ['seattle', 'pacific-northwest'],
    distance_mi: 0.7,
    store_address: '1401 Broadway, Seattle, WA 98122',
  },

  // ── Miami ──
  {
    store: 'Publix (Brickell)',
    pack_desc: '12-Pack Cans',
    price: 5.33,
    cans: 12,
    oz_per_can: 12,
    deal_badge: '☀️ PUBLIX B2G1 PROMO ($0.44/can)',
    deal_desc: 'Buy 2 Get 1 Free (36 Cans = $15.98)',
    effective_per_can: 0.44,
    min_units: 3,
    upfront_cost: 15.98,
    regions: ['miami', 'florida'],
    distance_mi: 1.1,
    store_address: '134 SW 13th St, Miami, FL 33130',
  },

  // ── National Defaults ──
  {
    store: 'Walmart Supercenter',
    pack_desc: '24-Pack Cans',
    price: 10.98,
    cans: 24,
    oz_per_can: 12,
    deal_badge: 'EVERYDAY LOW PRICE ($0.46/can)',
    deal_desc: 'National Baseline',
    effective_per_can: 0.46,
    min_units: 1,
    upfront_cost: 10.98,
    regions: ['national'],
    distance_mi: 3.4,
    store_address: 'Nearest Walmart Supercenter',
  },
  {
    store: 'Costco Wholesale',
    pack_desc: '36-Pack Cans',
    price: 17.49,
    cans: 36,
    oz_per_can: 12,
    deal_badge: '🏪 MEMBERS ONLY — CLUB BENCHMARK ($0.49/can)',
    deal_desc: 'Costco Wholesale Club Flat ($17.49 upfront)',
    effective_per_can: 0.49,
    min_units: 1,
    upfront_cost: 17.49,
    regions: ['national'],
    distance_mi: 5.2,
    store_address: 'Nearest Costco Wholesale',
  },
]

// ---------------------------------------------------------------------------
// 3. REFERENCE CONSTANTS
// ---------------------------------------------------------------------------

export const REFERENCE_CONSTANTS = {
  BODEGA_SINGLE_CAN_PRICE: 1.75,
  BODEGA_SINGLE_BOTTLE_PRICE: 2.99,
  CAFFEINE_MG_PER_12OZ: 46,
  WALKING_SPEED_MPH: 3.1,
  DRIVING_SPEED_MPH: 22.0,
}
