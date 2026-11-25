'use client'

import { useState, useEffect } from 'react'
import { StashResult } from '@/types'
import {
  PackageIcon,
  MapPinIcon,
  StoreIcon,
  FlameIcon,
  BoltIcon,
  BarChartIcon,
} from '@/components/Icons'

function stripLeadingEmoji(text: string): string {
  return text.replace(
    /^(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\uFE0F|\u200D|\s)+/,
    ''
  )
}

interface StashCardProps {
  data: StashResult | null
  loading: boolean
}

function StashSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-36 bg-dc-silver-dark/35 rounded-full" />
      <div className="h-16 sm:h-20 w-48 bg-dc-silver-dark/35 rounded-lg mx-auto" />
      <div className="h-4 w-56 bg-dc-silver-dark/35 rounded mx-auto" />
      <div className="h-10 w-full bg-dc-silver-dark/35 rounded-lg" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-dc-silver-dark/35 rounded" />
        <div className="h-4 w-full bg-dc-silver-dark/35 rounded" />
        <div className="h-4 w-full bg-dc-silver-dark/35 rounded" />
      </div>
      <div className="h-12 w-full bg-dc-silver-dark/35 rounded-xl mt-2" />
    </div>
  )
}

const STASH_METRIC_DEFINITIONS: Record<string, string> = {
  upfront_outlay: 'Total register checkout outlay required to capture this pack format.',
  unit_cost: 'Effective cost per 12oz can within this bulk pack format.',
  caffeine_yield: 'Cost per milligram of bioavailable caffeine (Diet Coke contains 46mg per 12oz can).',
  vs_bodega: 'Arbitrage savings spread compared to a $1.75 corner-store 12oz single can.',
}

export default function StashCard({ data, loading }: StashCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<'best' | 'pack12' | 'pack24' | 'costco'>('best')
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)
  const [showLiveInfo, setShowLiveInfo] = useState(false)

  useEffect(() => {
    setSelectedFormat('best')
  }, [data?.store_name, data?.zip_code])

  if (loading || !data) return <StashSkeleton />

  const tiers = [
    data.pack_tiers?.pack12,
    data.pack_tiers?.pack24,
    data.pack_tiers?.costco,
  ].filter((t): t is NonNullable<typeof t> => Boolean(t))

  const bestTier =
    tiers.find((t) => t.is_best_unit_cost) ??
    (tiers.length > 0
      ? tiers.reduce((min, curr) =>
          curr.unit_cost_per_can < min.unit_cost_per_can ? curr : min
        )
      : undefined)

  const active =
    selectedFormat !== 'best' && data.pack_tiers?.[selectedFormat]
      ? data.pack_tiers[selectedFormat]!
      : bestTier ?? data

  const spreadColor =
    active.vs_bodega_spread < 0 ? 'text-dc-positive' : 'text-dc-crimson-text'

  const toggleMetric = (id: string) => {
    setExpandedMetric((prev) => (prev === id ? null : id))
  }

  const primaryMapsUrl = active.google_maps_url || active.maps_url

  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5">
      {/* Header Badge */}
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="inline-flex items-center gap-1.5 bg-blue-500/10 text-dc-info px-3 py-1 rounded-full font-body text-xs uppercase tracking-widest font-semibold">
            <PackageIcon className="w-3.5 h-3.5" />
            <span>THE STASH</span>
          </h2>
          <span className="hidden sm:inline-block font-body text-xs text-dc-ink-muted uppercase tracking-widest">
            Bulk Arbitrage
          </span>
        </div>

        {active.is_live_api === true && (
          <button
            type="button"
            aria-expanded={showLiveInfo}
            aria-controls="stash-live-info"
            onClick={() => setShowLiveInfo((prev) => !prev)}
            className="inline-flex items-center gap-1.5 min-h-[44px] bg-emerald-500/10 text-dc-positive-badge border border-emerald-500/30 px-3 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer motion-fade-in"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>LIVE SHELF FEED</span>
            <span aria-hidden="true" className="text-[11px]">{showLiveInfo ? '−' : '?'}</span>
          </button>
        )}
      </div>

      {active.is_live_api === true && showLiveInfo && (
        <p id="stash-live-info" className="text-xs font-mono text-dc-positive-badge bg-emerald-50/90 px-3 py-2 rounded-lg">
          Real-time verified grocery shelf pricing via King Soopers / Kroger API.
        </p>
      )}

      {/* MASSIVE PRICE */}
      <div className="text-center py-1 sm:py-2">
        <span className="font-display text-[clamp(2.75rem,13vw,6rem)] text-dc-black leading-none tracking-tight whitespace-nowrap">
          {active.formatted_price}
        </span>
      </div>

      {/* Pack Description & Store Address */}
      <div className="text-center px-2">
        <p className="font-body text-xs sm:text-sm text-dc-ink-secondary font-medium text-pretty break-words">
          {active.pack_desc} • {active.store_name} ({active.distance_mi} mi away)
        </p>
        {active.store_address && (
          <p className="font-mono text-xs text-dc-ink-muted mt-0.5 text-pretty break-words">
            <MapPinIcon className="w-3.5 h-3.5 inline-block align-[-2px] mr-1" />
            {active.store_address}
          </p>
        )}
      </div>

      {/* Deal Badge */}
      {active.deal_badge && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-y border-amber-500/25 px-3.5 py-2 text-center">
          <span className="font-body text-xs sm:text-sm font-semibold text-dc-gold-text break-words">
            {/club|members/i.test(active.deal_badge) ? (
              <StoreIcon className="w-4 h-4 inline-block align-[-2px] mr-1.5" />
            ) : (
              <FlameIcon className="w-4 h-4 inline-block align-[-2px] mr-1.5" />
            )}
            {stripLeadingEmoji(active.deal_badge)}
          </span>
        </div>
      )}

      {/* Upfront Cash Requirement Callout for Multi-buy Promos */}
      {active.min_units && active.min_units > 1 && (
        <div className="bg-blue-50/85 border-y border-blue-200/80 px-3.5 py-2 text-center">
          <span className="font-mono text-xs text-blue-900">
            <BoltIcon className="w-3.5 h-3.5 inline-block align-[-2px] mr-1 text-dc-info" />
            <strong>UPFRONT CASH OUTLAY:</strong> Requires purchasing <strong>{active.min_units} packs</strong> ({(active.cans || 12) * active.min_units} cans total) for <strong>${active.upfront_cost?.toFixed(2)}</strong> at checkout.
          </span>
        </div>
      )}

      {/* 3-TIER BULK PACK FORMAT BENCHMARK MATRIX */}
      {data.pack_tiers && (
        <div className="border-y border-gray-200/80 py-3 flex flex-col gap-2.5">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-dc-ink-muted font-semibold flex items-center gap-1.5">
              <BarChartIcon className="w-3.5 h-3.5" />
              <span>PACK FORMAT SPREADS</span>
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-wider text-dc-ink-muted">
              SELECT FORMAT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-2">
            {/* 12-Pack Tier */}
            {data.pack_tiers.pack12 && (
              <button
                type="button"
                aria-pressed={selectedFormat === 'pack12' || (selectedFormat === 'best' && bestTier === data.pack_tiers.pack12)}
                onClick={() => setSelectedFormat(selectedFormat === 'pack12' ? 'best' : 'pack12')}
                className={`p-2.5 min-h-[44px] w-full rounded-lg border text-left transition-all cursor-pointer relative ${
                  (selectedFormat === 'pack12' || (selectedFormat === 'best' && bestTier === data.pack_tiers.pack12))
                    ? 'border-dc-crimson bg-white shadow-sm ring-1 ring-dc-crimson/50'
                    : 'border-dc-border-control hover:border-dc-border-control bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-1 mb-1">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-dc-black">
                    12-PACK
                  </span>
                  {data.pack_tiers.pack12.is_best_unit_cost && (
                    <span className="bg-emerald-100 text-dc-positive-badge text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold">
                      BEST UNIT
                    </span>
                  )}
                </div>
                <div className="text-sm font-display text-dc-black leading-tight">
                  {data.pack_tiers.pack12.formatted_price}
                  <span className="text-xs font-normal text-dc-ink-muted ml-1">/pk</span>
                </div>
                <div className="text-[11px] font-mono font-semibold text-dc-ink-secondary mt-0.5 break-words">
                  {data.pack_tiers.pack12.formatted_upfront ?? '$24.95 (5 Pk Req)'}
                </div>
                <div className="text-[11px] font-mono text-dc-positive font-bold mt-0.5">
                  ${data.pack_tiers.pack12.unit_cost_per_can.toFixed(2)}/can
                </div>
              </button>
            )}

            {/* 24-Pack Tier */}
            {data.pack_tiers.pack24 && (
              <button
                type="button"
                aria-pressed={selectedFormat === 'pack24' || (selectedFormat === 'best' && bestTier === data.pack_tiers.pack24)}
                onClick={() => setSelectedFormat(selectedFormat === 'pack24' ? 'best' : 'pack24')}
                className={`p-2.5 min-h-[44px] w-full rounded-lg border text-left transition-all cursor-pointer relative ${
                  (selectedFormat === 'pack24' || (selectedFormat === 'best' && bestTier === data.pack_tiers.pack24))
                    ? 'border-dc-crimson bg-white shadow-sm ring-1 ring-dc-crimson/50'
                    : 'border-dc-border-control hover:border-dc-border-control bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-1 mb-1">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-dc-black">
                    24-PACK
                  </span>
                  {data.pack_tiers.pack24.is_best_unit_cost && (
                    <span className="bg-emerald-100 text-dc-positive-badge text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold">
                      BEST UNIT
                    </span>
                  )}
                </div>
                <div className="text-sm font-display text-dc-black leading-tight">
                  {data.pack_tiers.pack24.formatted_price}
                </div>
                <div className="text-[11px] font-mono font-semibold text-dc-ink-secondary mt-0.5 break-words">
                  {data.pack_tiers.pack24.formatted_upfront ?? '$13.00 (1 Case)'}
                </div>
                <div className="text-[11px] font-mono text-dc-ink-muted font-bold mt-0.5">
                  ${data.pack_tiers.pack24.unit_cost_per_can.toFixed(2)}/can
                </div>
              </button>
            )}

            {/* Costco 36-Pack Benchmark */}
            {data.pack_tiers.costco && (
              <button
                type="button"
                aria-pressed={selectedFormat === 'costco' || (selectedFormat === 'best' && bestTier === data.pack_tiers.costco)}
                onClick={() => setSelectedFormat(selectedFormat === 'costco' ? 'best' : 'costco')}
                className={`p-2.5 min-h-[44px] w-full rounded-lg border text-left transition-all cursor-pointer relative ${
                  (selectedFormat === 'costco' || (selectedFormat === 'best' && bestTier === data.pack_tiers.costco))
                    ? 'border-dc-crimson bg-white shadow-sm ring-1 ring-dc-crimson/50'
                    : 'border-dc-border-control hover:border-dc-border-control bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-1 mb-1">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-dc-black">
                    COSTCO 36
                  </span>
                  <span className="bg-blue-100 text-dc-info-badge text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold">
                    CLUB
                  </span>
                </div>
                <div className="text-sm font-display text-dc-black leading-tight">
                  {data.pack_tiers.costco.formatted_price}
                </div>
                <div className="text-[11px] font-mono font-semibold text-dc-ink-secondary mt-0.5 break-words">
                  {data.pack_tiers.costco.formatted_upfront ?? '$17.49 (Club Flat)'}
                </div>
                <div className="text-[11px] font-mono text-dc-info font-bold mt-0.5">
                  ${data.pack_tiers.costco.unit_cost_per_can.toFixed(2)}/can
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* FINANCIAL METRICS */}
      <div className="space-y-0">
        <div className="border-b border-gray-200/60">
          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              aria-expanded={expandedMetric === 'upfront_outlay'}
              aria-controls="stash-def-upfront_outlay"
              onClick={() => toggleMetric('upfront_outlay')}
              className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              <span>UPFRONT OUTLAY</span>
              <span className="text-[11px] font-mono" aria-hidden="true">?</span>
            </button>
            <span className="font-body text-xs tabular-nums font-bold text-dc-black text-right break-words">
              {active.formatted_upfront ?? `$${active.price.toFixed(2)} UPFRONT`}
            </span>
          </div>
          {expandedMetric === 'upfront_outlay' && (
            <p id="stash-def-upfront_outlay" className="pb-2 text-xs font-body text-dc-ink-secondary">
              {STASH_METRIC_DEFINITIONS.upfront_outlay}
            </p>
          )}
        </div>

        <div className="border-b border-gray-200/60">
          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              aria-expanded={expandedMetric === 'unit_cost'}
              aria-controls="stash-def-unit_cost"
              onClick={() => toggleMetric('unit_cost')}
              className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              <span>UNIT COST</span>
              <span className="text-[11px] font-mono" aria-hidden="true">?</span>
            </button>
            <span className="font-body text-xs tabular-nums font-medium text-dc-black">
              ${active.unit_cost_per_can.toFixed(2)} / CAN
            </span>
          </div>
          {expandedMetric === 'unit_cost' && (
            <p id="stash-def-unit_cost" className="pb-2 text-xs font-body text-dc-ink-secondary">
              {STASH_METRIC_DEFINITIONS.unit_cost}
            </p>
          )}
        </div>

        <div className="border-b border-gray-200/60">
          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              aria-expanded={expandedMetric === 'caffeine_yield'}
              aria-controls="stash-def-caffeine_yield"
              onClick={() => toggleMetric('caffeine_yield')}
              className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              <span>CAFFEINE YIELD</span>
              <span className="text-[11px] font-mono" aria-hidden="true">?</span>
            </button>
            <span className="font-body text-xs tabular-nums font-medium text-dc-black">
              ${active.caffeine_cost_per_mg.toFixed(3)} / mg
            </span>
          </div>
          {expandedMetric === 'caffeine_yield' && (
            <p id="stash-def-caffeine_yield" className="pb-2 text-xs font-body text-dc-ink-secondary">
              {STASH_METRIC_DEFINITIONS.caffeine_yield}
            </p>
          )}
        </div>

        <div className="border-b border-gray-200/60">
          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              aria-expanded={expandedMetric === 'vs_bodega'}
              aria-controls="stash-def-vs_bodega"
              onClick={() => toggleMetric('vs_bodega')}
              className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              <span>VS. BODEGA SINGLE</span>
              <span className="text-[11px] font-mono" aria-hidden="true">?</span>
            </button>
            <span
              className={`font-body text-xs tabular-nums font-semibold ${spreadColor}`}
            >
              {active.vs_bodega_spread > 0 ? '+' : ''}
              {active.vs_bodega_spread}% SPREAD
            </span>
          </div>
          {expandedMetric === 'vs_bodega' && (
            <p id="stash-def-vs_bodega" className="pb-2 text-xs font-body text-dc-ink-secondary">
              {STASH_METRIC_DEFINITIONS.vs_bodega}
            </p>
          )}
        </div>
      </div>

      {/* Runner Up */}
      {data.runner_up && (
        <div className="pt-1">
          <span className="font-body text-xs uppercase tracking-wider text-dc-ink-muted font-medium">
            RUNNER UP:
          </span>
          <p className="font-body text-xs text-dc-ink-muted text-pretty mt-0.5 break-words">
            {data.runner_up.store_name} — {data.runner_up.deal_desc}
            {!data.runner_up.deal_desc.includes('$')
              ? ` ($${data.runner_up.price.toFixed(2)})`
              : ''}
          </p>
        </div>
      )}

      {/* Route Action & Maps Selector */}
      <div className="mt-auto pt-1 flex flex-col gap-2">
        <a
          href={primaryMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get driving directions to ${active.store_name} in Google Maps`}
          className="block w-full bg-dc-crimson hover:bg-dc-crimson-dark text-white font-display text-base sm:text-lg text-center py-3 px-4 min-h-[48px] rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm motion-safe:active:scale-[0.99]"
        >
          <MapPinIcon className="w-4 h-4" />
          <span>[ ROUTE TO {active.store_name.toUpperCase()} ]</span>
        </a>

        {/* Quick Maps App Links */}
        <div className="flex items-center justify-center gap-2 pt-0.5 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-dc-ink-muted font-mono">
            Open in:
          </span>
          <a
            href={active.apple_maps_url || active.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open driving directions to ${active.store_name} in Apple Maps`}
            className="inline-flex items-center justify-center px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-lg text-xs font-mono border border-dc-border-control bg-white/60 hover:bg-white text-dc-ink hover:text-dc-crimson-text transition-colors duration-150"
          >
            Apple Maps
          </a>
          <a
            href={active.google_maps_url || active.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open driving directions to ${active.store_name} in Google Maps`}
            className="inline-flex items-center justify-center px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-lg text-xs font-mono border border-dc-border-control bg-white/60 hover:bg-white text-dc-ink hover:text-dc-crimson-text transition-colors duration-150"
          >
            Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
