# Kroger / King Soopers Live Pricing Proxy (Cloudflare Worker)

An ultra-low latency, zero-cost edge proxy (`fridgecig-kroger-proxy`, configured in `wrangler.toml`) deployed to Cloudflare Workers to interface with the Kroger Developer API, cache OAuth tokens, bypass CORS, and provide structured 3-tier bulk pricing feeds for **The Diet Coke Index**.

Live worker endpoint: `https://fridgecig-kroger-proxy.robertyoushock.workers.dev`

## Architecture & Recent Fixes
1. **OAuth2 Client Credentials Token Caching:** Caches the Kroger Bearer token in worker memory to prevent token exhaustion.
2. **Colorado Regional Guard & NYC / Out-of-Region Fallback Fix:**
   - `isColoradoRequest(lat, lng, zip)` validates incoming coordinates (`36.9 <= lat <= 41.1`, `-109.1 <= lng <= -102.0`) and ZIP codes (`^8[01]\d{3}`) before querying Kroger or returning Denver fallback data.
   - Upstream Kroger store responses are also checked for `state === 'CO'`, Colorado ZIP, and a `MAX_KROGER_COVERAGE_MILES` (`25` mi) radius, and the Costco Denver Central club benchmark is scoped strictly to Colorado (`location.address?.state === 'CO'`).
   - Out-of-region requests (e.g., NYC / Manhattan) return `outsideRegionResponse(...)`:
     ```json
     {
       "is_live_api": false,
       "source": "outside_kroger_region",
       "coverage": false,
       "error": "..."
     }
     ```
     instead of falling back to Denver King Soopers data.
3. **Truthful Colorado Fallback & Clean Badge Strings:**
   - When Kroger secrets are unset or upstream calls fail for an in-Colorado request, `getDenverFallback()` returns the Capitol Hill King Soopers directory baseline with `is_live_api: false` and `source: 'fallback_directory'`.
   - All `deal_badge` strings in live and fallback tiers are plain, emoji-free uppercase strings.
4. **CORS & Cache Headers:** Attaches permissive CORS headers and 5-minute edge caching (`Cache-Control: public, max-age=300`).

## External Worker Deployment
Authenticate with Cloudflare first if `npx wrangler whoami` shows you are not logged in:

```bash
npx wrangler login
```

Install Worker dependencies, ensure required Kroger API secrets are set, and deploy from `worker/`:

```bash
cd worker && npm install && npx wrangler deploy
```

If setting up secrets for the first time (or rotating credentials):

```bash
cd worker
npx wrangler secret put KROGER_CLIENT_ID
npx wrangler secret put KROGER_CLIENT_SECRET
npx wrangler deploy
```

> **Note:** Even before the external Worker is redeployed, the frontend client (`src/lib/kroger.ts`) enforces an independent Colorado/distance guard (`isValidWorkerResponse`) and strips leading badge emojis (`src/components/StashCard.tsx`), but redeploying `worker/` ensures the edge endpoint itself returns `outside_kroger_region` directly.

## Post-Deploy Verification (`curl`)

Check worker health:
```bash
curl -sS "https://fridgecig-kroger-proxy.robertyoushock.workers.dev/health"
```

Verify NYC / out-of-region request returns `coverage: false`, `is_live_api: false`, and `source: "outside_kroger_region"` (never Denver King Soopers):
```bash
curl -sS "https://fridgecig-kroger-proxy.robertyoushock.workers.dev/?lat=40.758&lng=-73.9855&zip=10001"
```

Verify Denver request returns live Kroger pricing (`source: "kroger_live"`, `is_live_api: true` when secrets are configured) or Colorado fallback (`source: "fallback_directory"`, `is_live_api: false`):
```bash
curl -sS "https://fridgecig-kroger-proxy.robertyoushock.workers.dev/?lat=39.7392&lng=-104.9903&zip=80203"
```
