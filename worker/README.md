# Kroger / King Soopers Live Pricing Proxy (Cloudflare Worker)

An ultra-low latency, zero-cost edge proxy deployed to Cloudflare Workers to interface with the Kroger Developer API, cache OAuth tokens, bypass CORS, and provide structured 3-tier bulk pricing feeds for **The Diet Coke Index**.

## Architecture & Features
1. **OAuth2 Client Credentials Token Caching:** Caches the Kroger Bearer token in worker memory / edge cache to prevent token exhaustion.
2. **Deterministic Fallback:** If upstream Kroger API credentials are unset or Kroger's endpoints rate-limit, seamlessly falls back to the Denver King Soopers zip-geocoded local directory without throwing errors.
3. **CORS Headers:** Automatically attaches permissive CORS and 5-minute CDN caching headers (`public, max-age=300`).

## Deployment
```bash
cd worker
npm install
npx wrangler secret put KROGER_CLIENT_ID
npx wrangler secret put KROGER_CLIENT_SECRET
npx wrangler deploy
```

The live worker endpoint is: `https://fridgecig-kroger-proxy.robertyoushock.workers.dev`
