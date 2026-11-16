# THE DIET COKE INDEX (FRIDGE CIG) — AGENT ONBOARDING & CONTEXT BIBLE

> **For AI Agents & Engineers:** Read this document first. It contains complete architectural context, design philosophy, file maps, business logic rules, and historical gotchas for **The Diet Coke Index**.

---

## 1. Executive Summary & Brand Identity

* **Product Name:** The Diet Coke Index (Code Name: `FRIDGE CIG`)
* **Live Production URL:** `https://robertyoushock.com/fridgecig/` (also mirrored at `https://robertyoushock.github.io/fridgecig/`)
* **Primary Premise:** A Bloomberg Terminal for Diet Coke. Built for the 2:15 PM afternoon wall when an office worker needs an ice-cold caffeinated hit and refuses to pay $4.00 for a lukewarm 20oz bottle from a convenience store.
* **Tone & Voice:** Deadpan Wall Street commodities trading precision mixed with pop-art luxury. Treats a 12oz aluminum beverage with the gravity of high-frequency oil or gold arbitrage. Key terminology: *Arbitrage Desk, Spot Price, Spread vs Bodega, Caffeine Yield ($/mg), Purist Protocol, Heresy Intervention*.
* **Operating Constraint:** Must cost **$0.00/month** to operate indefinitely. Built on Next.js static export (`output: 'export'`), static GitHub Pages hosting, free-tier Cloudflare Workers, and native browser Web Audio API.

---

## 2. Core User Experience & Interface

The application viewport delivers two primary decisions instantly:

1. **THE BURN (Immediate Single-Serve Relief):**
   * Scans immediate walking distance (0.1 to 1.5 mi) for the lowest unit-cost cold pour.
   * Compares 32oz/44oz fountain pours (Circle K, 7-Eleven, RaceTrac) against cans and bottles.
   * **The Gold Standard (McDonald's):** Identifies McDonald's 34°F closed-loop fountain installations and surfaces an interactive technical schematic blueprint explaining why McDonald's fountain Diet Coke tastes superior (stainless steel bulk tanks, pre-chilled lines, wide-bore straw dynamics).

2. **THE STASH (Bulk Fridge-Loading Arbitrage):**
   * The commodities breakdown for home/office stock.
   * Compares all packaging formats across supermarkets, club stores, and big-box retailers.
   * **3-Tier Format Matrix:** Displays side-by-side tabs for:
     * **12-Pack:** Supermarket multi-buy promo specials (e.g. King Soopers $4.99 Buy-5+ deal).
     * **24-Pack:** Single-case shelf option for low upfront friction ($13.00 single case).
     * **Costco 36-Pack:** Wholesale club bulk flat benchmark ($17.49 club flat).
   * **Interactive Route Switching:** Tapping any tier immediately updates the hero price, metrics, and routes driving directions directly to that specific store in Apple Maps or Google Maps.
   * **Upfront Outlay Transparency:** Explicitly displays total register checkout outlay (e.g., `$24.95 (5 Pk Req)`) to prevent misleading users on multi-buy bulk deals.

3. **Purist Filter & Easter Eggs:**
   * Segmented format controller: `[ CAN ]`, `[ FOUNTAIN ]`, `[ ANYTHING ]`.
   * **The Heresy Warning:** A red `[ 🔴 PLASTIC 2-LITER ] [ BANNED ]` tag opens a high-drama modal lecturing the user on polyethylene terephthalate gas permeability and accelerated CO₂ degradation.
   * **Condensation Physics:** Interactive SVG droplets on the anodized aluminum surface that slide, pop with Web Audio sound effects, and wipe clean.
   * **Keyboard Shortcuts:** `C` (Can mode), `F` (Fountain mode), `A` (Anything mode), `L` (Toggle GPS lock), `R` (Manual Price Refresh), `Esc` (Close modals).

---

## 3. Technology Stack & Directory Structure

```
fridgecig/
├── AGENT_CONTEXT.md              # THIS FILE — complete onboarding context
├── README.md                     # Public repository documentation & visuals
├── package.json                  # Next.js 14, React 18, Tailwind CSS, TypeScript
├── next.config.mjs               # Static export config (output: 'export', basePath: '/fridgecig')
├── tailwind.config.ts            # Custom palette (dc-crimson, dc-silver, dc-black, etc.)
├── tsconfig.json                 # TypeScript strict mode with @/ path aliases
│
├── docs/                         # Architecture diagrams and promotional imagery
│   └── images/
│
├── public/                       # Favicons, icons, and static manifest assets
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # HTML root, viewport, Inter & Anton typography fonts
│   │   ├── page.tsx              # Main dashboard orchestrator, keyboard handlers, refresh loop
│   │   └── globals.css           # Glassmorphism, terminal utilities, animation keyframes
│   │
│   ├── components/
│   │   ├── BurnCard.tsx          # Single-serve hero card with walking pace & maps routing
│   │   ├── StashCard.tsx         # Bulk arbitrage card, 3-tier matrix, upfront outlay display
│   │   ├── CoordinateLock.tsx    # Geolocation controller with 7 regional trading hub presets
│   │   ├── PuristFilter.tsx      # Segmented filter buttons + plastic 2-liter easter egg
│   │   ├── CondensationDroplets.tsx # Interactive draggable/tappable condensation physics
│   │   ├── GoldStandardSchematic.tsx # McDonald's 34°F closed-loop blueprint modal
│   │   ├── SeekHelpModal.tsx     # Purist protocol heresy intervention warning modal
│   │   ├── TickerTape.tsx        # High-frequency trading ticker tape header
│   │   └── Colophon.tsx          # Engineering colophon and methodology notes
│   │
│   ├── data/
│   │   └── store-matrix.ts       # Curated retail prices across 7 major metro trading hubs
│   │
│   ├── lib/
│   │   ├── pricing.ts            # Mathematical intelligence engine, deterministic variance
│   │   ├── kroger.ts             # Client Kroger API hydration & Colorado zip directory fallback
│   │   ├── geolocation.ts        # Geohash resolution, distance calculations, Apple/Google Maps URLs
│   │   ├── sound.ts              # Procedural Web Audio API sound synthesis (can crack, pop)
│   │   └── can-open-audio.ts     # Base64 encoded low-latency audio sample
│   │
│   └── types.ts                  # TypeScript interface contracts across the entire engine
│
└── worker/                       # Cloudflare Worker proxy for Kroger Developer API
    ├── README.md                 # Cloudflare Worker deployment runbook
    ├── package.json              # Wrangler devDependencies
    ├── wrangler.toml             # Cloudflare Worker routing and environment definition
    └── src/
        └── index.ts              # Edge proxy: OAuth2 token cache, product scanner, unit-cost ranking
```

---

## 4. Architectural Deep Dive: The Data Engine

### 1. Deterministic Seeding (`src/lib/pricing.ts`)
To give the app a realistic, persistent financial feel without requiring a paid database:
* Prices are seeded using coordinates: `seedFromCoords(lat, lng, salt) = Math.sin(lat * 12.9898 + lng * 78.233 + salt)`.
* Every location generates identical, repeatable prices across refreshes, with small localized market variance (±$0.15).

### 2. Live Kroger / King Soopers API Hydration (`worker/src/index.ts` & `src/lib/kroger.ts`)
* When user coordinates enter Colorado (or zip starts with `80`), `src/lib/kroger.ts` fires an async fetch to the Cloudflare Worker proxy (`https://fridgecig-kroger-proxy.robertyoushock.workers.dev`).
* The worker authenticates with the Kroger Developer API (`api.kroger.com`), caches the OAuth2 client credentials token in edge memory, queries nearby store locations, and inspects live inventory for Diet Coke packs.
* **Fallback Guarantee:** If the worker is offline or credentials hit rate limits, `src/lib/kroger.ts` seamlessly falls back to a verified Colorado King Soopers directory covering exact stores by zip code (Capitol Hill `#62000029`, Speer `#0039`, Cherry Creek `#0048`, LoDo `#0115`, etc.).

### 3. Unit-Cost Arbitrage Scoring Rule (Crucial Logic)
**Never select packs based on pack size hierarchy!**
In supermarket retail, 12-packs frequently run aggressive multi-buy promotions that beat 24-packs on unit economics:
* **Option A (24-Pack single case):** $13.00 = **$0.54 / can**
* **Option B (12-Pack Buy-5+ deal):** $4.99 each ($24.95 for 60 cans) = **$0.42 / can**
* **The Rule:** The engine collects all available candidates (`12pk`, `24pk`, `36pk`), calculates `unitCost = price / cans`, sorts ascending, and crowns the lowest unit cost as the primary Stash.
* **The Runner-Up:** The runner-up slot is populated with the alternative pack format so consumers who don't want to carry 5 cases can choose the single 24-pack case.

### 4. Regional Trading Hubs (`src/data/store-matrix.ts`)
The app supports 7 distinct metropolitan trading hubs with authentic local chains:
1. **Denver / Colorado:** King Soopers, Safeway, Costco (Denver Central on S Zuni)
2. **Manhattan / New York:** Target (Herald Square), Costco (East Harlem), Duane Reade, Bodegas
3. **Chicago:** Jewel-Osco, Mariano's, Target
4. **Los Angeles:** Ralphs, Target, Costco
5. **Austin:** H-E-B, Target, Costco
6. **Seattle:** QFC, Fred Meyer, Costco
7. **Miami:** Publix, Target, Costco

---

## 5. Critical Historical Traps & Edge Cases

When modifying or expanding the codebase, be aware of these solved bugs:

1. **The Multi-Buy Upfront Outlay Trap:**
   * Showing "$4.99" for a 12-pack without showing the required minimum purchase causes customer sticker shock at checkout.
   * Always pair any multi-buy deal with its required units and total upfront cash (`$24.95 (5 Pk Req)`).
2. **The Regional Cross-Contamination Bug:**
   * Never run global `.find()` over `BULK_DEALS` without checking the active region. Earlier versions had Denver users seeing Costco East Harlem (Manhattan) because it appeared earlier in the array.
   * Always scope Costco and grocery deals to `matchingDeals` for the active coordinates/zip.
3. **The 300ms Async Hydration Flash:**
   * React renders the initial static baseline immediately, then swaps in live API results when the network promise resolves.
   * If the static baseline data (e.g. $8.99 old coupon) disagrees with the live feed ($4.99 promo), users will see a jarring flicker on page load.
   * Keep fallback matrix data in `store-matrix.ts` and `src/lib/kroger.ts` aligned with current live shelf conditions.
4. **Next.js Static Export Pathing:**
   * `next.config.mjs` specifies `basePath: '/fridgecig'`.
   * When creating asset links or routing URLs, always account for the `/fridgecig` base path.

---

## 6. How to Run, Build & Deploy

### Prerequisites
* Node.js 18+ or 20+
* npm

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
# http://localhost:3000/fridgecig
```

### Production Build & Deployment to GitHub Pages
The project builds into a zero-dependency static folder (`out/`):
```bash
# 1. Compile Next.js static export
npm run build

# 2. Copy static artifacts into the GitHub Pages hosting repo
rm -rf ../robertyoushock.github.io/fridgecig/*
cp -r out/* ../robertyoushock.github.io/fridgecig/

# 3. Commit and push from robertyoushock.github.io
cd ../robertyoushock.github.io
git add .
git commit -m "deploy: update fridgecig live build"
git push origin master
```

### Cloudflare Worker Deployment
```bash
cd worker
npm install
npx wrangler deploy

# Set Kroger API secrets (optional for live feed; fallback directory works without them)
npx wrangler secret put KROGER_CLIENT_ID
npx wrangler secret put KROGER_CLIENT_SECRET
```

---

*End of Agent Onboarding Bible. You now have full mastery of The Diet Coke Index.*
