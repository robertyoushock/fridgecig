'use client'

import { useState, useEffect } from 'react'
import { StashResult } from '@/types'
import { isAppleDevice } from '@/lib/geolocation'

interface StashCardProps {
  data: StashResult | null
  loading: boolean
}

function StashSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-36 bg-gray-200/60 rounded-full" />
      <div className="h-16 sm:h-20 w-48 bg-gray-200/60 rounded-lg mx-auto" />
      <div className="h-4 w-56 bg-gray-200/60 rounded mx-auto" />
      <div className="h-10 w-full bg-gray-200/60 rounded-lg" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200/60 rounded" />
        <div className="h-4 w-full bg-gray-200/60 rounded" />
        <div className="h-4 w-full bg-gray-200/60 rounded" />
      </div>
      <div className="h-12 w-full bg-gray-200/60 rounded-xl mt-2" />
    </div>
  )
}

export default function StashCard({ data, loading }: StashCardProps) {
  const [isApple, setIsApple] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'best' | 'pack12' | 'pack24' | 'costco'>('best')

  useEffect(() => {
    setIsApple(isAppleDevice())
  }, [])

  if (loading || !data) return <StashSkeleton />

  const active =
    selectedFormat !== 'best' && data.pack_tiers?.[selectedFormat]
      ? data.pack_tiers[selectedFormat]
      : data

  const spreadColor =
    active.vs_bodega_spread < 0 ? 'text-emerald-500' : 'text-dc-crimson'

  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5">
      {/* Header Badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full font-body text-xs uppercase tracking-widest font-semibold">
            📦 THE STASH
          </span>
          <span className="hidden sm:inline-block font-body text-[10px] text-gray-400 uppercase tracking-widest">
            Bulk Arbitrage
          </span>
        </div>

        {active.is_live_api && (
          <span
            title="Real-time verified grocery shelf pricing via King Soopers / Kroger API"
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold animate-[fade-in_0.3s_ease-out]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SHELF FEED
          </span>
        )}
      </div>

      {/* MASSIVE PRICE */}
      <div className="text-center py-1 sm:py-2">
        <span className="font-display text-[clamp(3.25rem,14vw,6rem)] text-dc-black leading-none tracking-tight whitespace-nowrap">
          {active.formatted_price}
        </span>
      </div>

      {/* Pack Description & Store Address */}
      <div className="text-center px-2">
        <p
          className="font-body text-xs sm:text-sm text-gray-700 font-medium truncate max-w-full"
          title={`${active.pack_desc} • ${active.store_name} (${active.distance_mi} mi away)`}
        >
          {active.pack_desc} • {active.store_name} ({active.distance_mi} mi away)
        </p>
        {active.store_address && (
          <p className="font-mono text-[11px] text-gray-400 mt-0.5 truncate" title={active.store_address}>
            📍 {active.store_address}
          </p>
        )}
      </div>

      {/* Deal Badge */}
      {active.deal_badge && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg px-3 sm:px-4 py-2 text-center">
          <span className="font-body text-xs sm:text-sm font-semibold text-amber-700 break-words">
            {active.deal_badge}
          </span>
        </div>
      )}

      {/* Upfront Cash Requirement Callout for Multi-buy Promos */}
      {active.min_units && active.min_units > 1 && (
        <div className="bg-blue-50 border border-blue-200/80 rounded-lg px-3 py-1.5 text-center">
          <span className="font-mono text-xs text-blue-900">
            ⚡ <strong>UPFRONT CASH OUTLAY:</strong> Requires purchasing <strong>{active.min_units} packs</strong> ({(active.cans || 12) * active.min_units} cans total) for <strong>${active.upfront_cost?.toFixed(2)}</strong> at checkout.
          </span>
        </div>
      )}

      {/* 3-TIER BULK PACK FORMAT BENCHMARK MATRIX */}
      {data.pack_tiers && (
        <div className="bg-gray-50/90 border border-gray-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1">
              <span>📊</span> PACK FORMAT SPREADS
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">
              TAP TO ROUTE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 12-Pack Tier */}
            {data.pack_tiers.pack12 && (
              <button
                type="button"
                onClick={() => setSelectedFormat(selectedFormat === 'pack12' ? 'best' : 'pack12')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                  (selectedFormat === 'pack12' || (selectedFormat === 'best' && data.pack_tiers.pack12.is_best_unit_cost))
                    ? 'border-dc-crimson bg-white shadow-xs ring-1 ring-dc-crimson/50'
                    : 'border-gray-200/80 hover:border-gray-300 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-dc-black">
                    12-PACK
                  </span>
                  {data.pack_tiers.pack12.is_best_unit_cost && (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold">
                      BEST UNIT
                    </span>
                  )}
                </div>
                <div className="text-sm font-display text-dc-black leading-tight">
                  {data.pack_tiers.pack12.formatted_price}
                  <span className="text-[10px] font-normal text-gray-500 ml-1">/pk</span>
                </div>
                <div className="text-[10px] font-mono font-semibold text-gray-700 mt-0.5">
                  {data.pack_tiers.pack12.formatted_upfront ?? '$24.95 (5 Pk Req)'}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 font-bold mt-0.5">
                  ${data.pack_tiers.pack12.unit_cost_per_can.toFixed(2)}/can
                </div>
              </button>
            )}

            {/* 24-Pack Tier */}
            {data.pack_tiers.pack24 && (
              <button
                type="button"
                onClick={() => setSelectedFormat(selectedFormat === 'pack24' ? 'best' : 'pack24')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                  (selectedFormat === 'pack24' || (selectedFormat === 'best' && data.pack_tiers.pack24.is_best_unit_cost))
                    ? 'border-dc-crimson bg-white shadow-xs ring-1 ring-dc-crimson/50'
                    : 'border-gray-200/80 hover:border-gray-300 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-dc-black">
                    24-PACK
                  </span>
                  {data.pack_tiers.pack24.is_best_unit_cost && (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold">
                      BEST UNIT
                    </span>
                  )}
                </div>
                <div className="text-sm font-display text-dc-black leading-tight">
                  {data.pack_tiers.pack24.formatted_price}
                </div>
                <div className="text-[10px] font-mono font-semibold text-gray-700 mt-0.5">
                  {data.pack_tiers.pack24.formatted_upfront ?? '$13.00 (1 Case)'}
                </div>
                <div className="text-[10px] font-mono text-gray-600 font-bold mt-0.5">
                  ${data.pack_tiers.pack24.unit_cost_per_can.toFixed(2)}/can
                </div>
              </button>
            )}

            {/* Costco 36-Pack Benchmark */}
            {data.pack_tiers.costco && (
              <button
                type="button"
                onClick={() => setSelectedFormat(selectedFormat === 'costco' ? 'best' : 'costco')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                  (selectedFormat === 'costco' || (selectedFormat === 'best' && data.pack_tiers.costco.is_best_unit_cost))
                    ? 'border-dc-crimson bg-white shadow-xs ring-1 ring-dc-crimson/50'
                    : 'border-gray-200/80 hover:border-gray-300 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-dc-black">
                    COSTCO 36
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold">
                    CLUB
                  </span>
                </div>
                <div className="text-sm font-display text-dc-black leading-tight">
                  {data.pack_tiers.costco.formatted_price}
                </div>
                <div className="text-[10px] font-mono font-semibold text-gray-700 mt-0.5">
                  {data.pack_tiers.costco.formatted_upfront ?? '$17.49 (Club Flat)'}
                </div>
                <div className="text-[10px] font-mono text-blue-600 font-bold mt-0.5">
                  ${data.pack_tiers.costco.unit_cost_per_can.toFixed(2)}/can
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* FINANCIAL METRICS */}
      <div className="space-y-0">
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Total register checkout outlay required to capture this price format"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            UPFRONT OUTLAY
          </span>
          <span className="font-body text-xs tabular-nums font-bold text-dc-black">
            {active.formatted_upfront ?? `$${active.price.toFixed(2)} UPFRONT`}
          </span>
        </div>
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Effective cost per 12oz can within this bulk pack format"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            UNIT COST
          </span>
          <span className="font-body text-xs tabular-nums font-medium text-dc-black">
            ${active.unit_cost_per_can.toFixed(2)} / CAN
          </span>
        </div>
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Cost per milligram of bioavailable caffeine (Diet Coke contains 46mg caffeine per 12oz can)"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            CAFFEINE YIELD
          </span>
          <span className="font-body text-xs tabular-nums font-medium text-dc-black">
            ${active.caffeine_cost_per_mg.toFixed(3)} / mg
          </span>
        </div>
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Arbitrage savings spread compared to the benchmark $2.99 bodega single cold can"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            VS. BODEGA SINGLE
          </span>
          <span
            className={`font-body text-xs tabular-nums font-semibold ${spreadColor}`}
          >
            {active.vs_bodega_spread > 0 ? '+' : ''}
            {active.vs_bodega_spread}% SPREAD
          </span>
        </div>
      </div>

      {/* Runner Up */}
      {data.runner_up && (
        <div className="pt-1">
          <span className="font-body text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            RUNNER UP:
          </span>
          <p className="font-body text-xs text-gray-500 mt-0.5">
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
          href={isApple ? (active.apple_maps_url || active.maps_url) : (active.google_maps_url || active.maps_url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get driving directions to ${active.store_name} in ${isApple ? 'Apple Maps' : 'Google Maps'}`}
          className="block w-full bg-dc-crimson hover:bg-dc-crimson-dark text-white font-display text-base sm:text-lg text-center py-3 px-4 min-h-[48px] rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>[ ROUTE TO {active.store_name.toUpperCase()} ]</span>
        </a>

        {/* Quick Maps App Selector */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono mr-0.5">App:</span>
          <a
            href={active.apple_maps_url || active.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open driving directions to ${active.store_name} in Apple Maps`}
            className={`inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono transition-all duration-150 ${
              isApple
                ? 'bg-white/90 text-dc-black font-bold shadow-xs border border-gray-300/80'
                : 'text-gray-500 hover:text-dc-black hover:bg-white/60'
            }`}
          >
             Apple Maps
          </a>
          <a
            href={active.google_maps_url || active.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open driving directions to ${active.store_name} in Google Maps`}
            className={`inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono transition-all duration-150 ${
              !isApple
                ? 'bg-white/90 text-dc-black font-bold shadow-xs border border-gray-300/80'
                : 'text-gray-500 hover:text-dc-black hover:bg-white/60'
            }`}
          >
            Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
