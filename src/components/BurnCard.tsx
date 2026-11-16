'use client'

import { useState, useEffect } from 'react'
import { BurnResult } from '@/types'
import { isAppleDevice } from '@/lib/geolocation'

interface BurnCardProps {
  data: BurnResult | null
  loading: boolean
  onOpenSchematic?: () => void
}

function BurnSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200/60 rounded-full" />
      <div className="h-16 sm:h-20 w-44 bg-gray-200/60 rounded-lg mx-auto" />
      <div className="h-4 w-52 bg-gray-200/60 rounded mx-auto" />
      <div className="flex gap-2 justify-center">
        <div className="h-7 w-24 bg-gray-200/60 rounded-full" />
        <div className="h-7 w-28 bg-gray-200/60 rounded-full" />
      </div>
      <div className="h-12 w-full bg-gray-200/60 rounded-xl mt-2" />
    </div>
  )
}

export default function BurnCard({ data, loading, onOpenSchematic }: BurnCardProps) {
  const [isApple, setIsApple] = useState(false)

  useEffect(() => {
    setIsApple(isAppleDevice())
  }, [])

  if (loading || !data) return <BurnSkeleton />

  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5">
      {/* Header Badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-dc-crimson/10 text-dc-crimson px-3 py-1 rounded-full font-body text-xs uppercase tracking-widest font-semibold">
            🔥 THE BURN
          </span>
          <span className="hidden sm:inline-block font-body text-[10px] text-gray-400 uppercase tracking-widest">
            Immediate Single
          </span>
        </div>

        {data.gold_standard && onOpenSchematic && (
          <button
            type="button"
            onClick={onOpenSchematic}
            title="McDonald's proprietary insulated recirculating pythons maintain syrup at 34°F–38°F"
            className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-900 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
          >
            <span>🏆</span> GOLD STANDARD ➔
          </button>
        )}
      </div>

      {/* MASSIVE PRICE */}
      <div className="text-center py-1 sm:py-2">
        <span className="font-display text-[clamp(3.25rem,14vw,6rem)] text-dc-black leading-none tracking-tight whitespace-nowrap">
          {data.formatted_price}
        </span>
      </div>

      {/* Product & Store info */}
      <div className="text-center px-2">
        <p
          className="font-body text-xs sm:text-sm text-gray-700 font-medium truncate max-w-full"
          title={`${data.size} • ${data.store_name} (${data.distance_mi} mi away)`}
        >
          {data.size} • {data.store_name} ({data.distance_mi} mi away)
        </p>
        <p className="font-mono text-[11px] text-gray-400 mt-0.5">
          🚶 ~{data.walk_time_mins} min walk ({data.distance_mi} mi)
        </p>
      </div>

      {/* FINANCIAL METRICS */}
      <div className="space-y-0">
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Liquid unit cost per fluid ounce"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            UNIT COST
          </span>
          <span className="font-body text-xs tabular-nums font-medium text-dc-black">
            ${data.unit_cost_per_oz.toFixed(3)} / OZ
          </span>
        </div>
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Estimated walking time from your pinned coordinates"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            TRANSIT TIME
          </span>
          <span className="font-body text-xs tabular-nums font-medium text-dc-black">
            {data.walk_time_mins} MIN WALK
          </span>
        </div>
        <div className="flex justify-between items-baseline py-2 border-b border-gray-200/60">
          <span
            title="Serving format and delivery vessel"
            className="font-body text-xs uppercase tracking-wider text-gray-500 border-b border-dotted border-gray-400 cursor-help"
          >
            VESSEL FORMAT
          </span>
          <span className="font-body text-xs tabular-nums font-semibold text-dc-crimson">
            {data.size.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Route Action & Maps Selector */}
      <div className="mt-auto pt-1 flex flex-col gap-2">
        <a
          href={isApple ? (data.apple_maps_url || data.maps_url) : (data.google_maps_url || data.maps_url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get directions to ${data.store_name} in ${isApple ? 'Apple Maps' : 'Google Maps'}`}
          className="block w-full bg-dc-black hover:bg-black text-white font-display text-base sm:text-lg text-center py-3 px-4 min-h-[48px] rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
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
          <span>[ ROUTE TO {data.store_name.toUpperCase()} ]</span>
        </a>

        {/* Quick Maps App Selector */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono mr-0.5">App:</span>
          <a
            href={data.apple_maps_url || data.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open directions to ${data.store_name} in Apple Maps`}
            className={`inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono transition-all duration-150 ${
              isApple
                ? 'bg-white/90 text-dc-black font-bold shadow-xs border border-gray-300/80'
                : 'text-gray-500 hover:text-dc-black hover:bg-white/60'
            }`}
          >
             Apple Maps
          </a>
          <a
            href={data.google_maps_url || data.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open directions to ${data.store_name} in Google Maps`}
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
