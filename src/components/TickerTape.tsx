'use client'

import { useState, useEffect } from 'react'
import { TickerData } from '@/types'

interface TickerTapeProps {
  data: TickerData
  locationLabel?: string
}

function deriveRegionLabel(locationLabel?: string): string {
  if (!locationLabel) return 'DENVER'
  const lower = locationLabel.toLowerCase()
  if (lower.includes('denver') || lower.includes('boulder')) return 'DENVER'
  if (lower.includes('manhattan') || lower.includes('nyc') || lower.includes('brooklyn')) return 'MANHATTAN'
  if (lower.includes('chicago')) return 'CHICAGO'
  if (lower.includes('austin')) return 'AUSTIN'
  if (lower.includes(', la') || lower.includes('los angeles') || lower.includes('hollywood') || lower.includes('beverly hills')) return 'LA'
  if (lower.includes('seattle')) return 'SEATTLE'
  if (lower.includes('miami')) return 'MIAMI'
  if (lower.includes('national')) return 'NATIONAL'
  return 'LOCAL'
}

export default function TickerTape({ data, locationLabel }: TickerTapeProps) {
  const [timeStr, setTimeStr] = useState('14:15 MT')
  const [showSpreadInfo, setShowSpreadInfo] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setTimeStr(`${hours}:${minutes} MT`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const regionLabel = deriveRegionLabel(locationLabel)

  return (
    <div
      role="region"
      aria-label="Diet Coke Market Ticker"
      className="w-full bg-dc-black text-white py-1.5 px-4 select-none"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono tabular-nums text-xs uppercase tracking-[0.14em] font-medium">
        <span>
          DCX SPOT PRICE: ${data.spot_price_per_oz.toFixed(3)}/OZ{' '}
          <span className={data.spot_direction === 'up' ? 'text-dc-ticker-up' : 'text-dc-ticker-down'}>
            {data.spot_direction === 'up' ? '▲' : '▼'}
          </span>
        </span>
        <span aria-hidden="true" className="text-gray-400 hidden sm:inline">//</span>
        <span>
          {regionLabel} AVG 12-PACK: ${data.avg_12pk.toFixed(2)}{' '}
          <span className={data.avg_12pk_direction === 'up' ? 'text-dc-ticker-up' : 'text-dc-ticker-down'}>
            {data.avg_12pk_direction === 'up' ? '▲' : '▼'}
          </span>
        </span>
        <span aria-hidden="true" className="text-gray-400 hidden sm:inline">//</span>
        <button
          type="button"
          aria-expanded={showSpreadInfo}
          aria-controls="ticker-spread-info"
          onClick={() => setShowSpreadInfo((prev) => !prev)}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 py-1 rounded text-xs font-mono uppercase tracking-[0.14em] text-gray-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
        >
          <span>FOUNTAIN VS 20OZ BOTTLE: {data.fountain_spread_pct}%</span>
          <span className="text-gray-300 text-[11px]" aria-hidden="true">
            {showSpreadInfo ? '[−]' : '[?]'}
          </span>
        </button>
        <span aria-hidden="true" className="text-gray-400 hidden sm:inline">//</span>
        <span>INDEX TICK: {timeStr}</span>
      </div>
      {showSpreadInfo && (
        <div
          id="ticker-spread-info"
          className="max-w-6xl mx-auto pt-1.5 pb-1 text-center font-mono text-xs text-gray-200 border-t border-white/15"
        >
          Spot per-ounce price vs. the $1.75 / 12oz corner-store single can benchmark (or 20oz retail bottle spread inside THE BURN).
        </div>
      )}
    </div>
  )
}
