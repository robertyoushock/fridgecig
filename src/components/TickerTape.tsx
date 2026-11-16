'use client'

import { useState, useEffect } from 'react'
import { TickerData } from '@/types'

interface TickerTapeProps {
  data: TickerData
}

export default function TickerTape({ data }: TickerTapeProps) {
  const [timeStr, setTimeStr] = useState('14:15 MT')

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

  const tickerItem = (
    <div className="flex items-center shrink-0 px-6 sm:px-8">
      <span className="whitespace-nowrap">
        DCX SPOT PRICE: ${data.spot_price_per_oz.toFixed(3)}/OZ{' '}
        <span className={data.spot_direction === 'up' ? 'text-dc-crimson' : 'text-emerald-400'}>
          {data.spot_direction === 'up' ? '▲' : '▼'}
        </span>
        <span className="mx-4 text-gray-500">//</span>
      </span>
      <span className="whitespace-nowrap">
        DENVER AVG 12-PACK: ${data.avg_12pk.toFixed(2)}{' '}
        <span className={data.avg_12pk_direction === 'up' ? 'text-dc-crimson' : 'text-emerald-400'}>
          {data.avg_12pk_direction === 'up' ? '▲' : '▼'}
        </span>
        <span className="mx-4 text-gray-500">//</span>
      </span>
      <span className="whitespace-nowrap">
        <span
          title="Percentage cost reduction of fountain dispenser drinks compared to 20oz bottled soda"
          className="cursor-help"
        >
          FOUNTAIN VS BOTTLE SPREAD: {data.fountain_spread_pct}%
        </span>
        <span className="mx-4 text-gray-500">//</span>
      </span>
      <span className="whitespace-nowrap">INDEX TICK: {timeStr}</span>
    </div>
  )

  return (
    <div
      role="region"
      aria-label="Diet Coke Market Ticker"
      className="w-full bg-dc-black text-white py-2 overflow-hidden relative select-none"
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-dc-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-dc-black to-transparent z-10 pointer-events-none" />

      <div className="ticker-gradient">
        <div
          title="Hover or hold to pause live market ticker"
          className="animate-ticker hover:[animation-play-state:paused] active:[animation-play-state:paused] focus-within:[animation-play-state:paused] flex font-body text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium cursor-grab active:cursor-grabbing"
        >
          {tickerItem}
          <div className="flex items-center shrink-0 px-8" aria-hidden="true">
            {tickerItem}
          </div>
          <div className="flex items-center shrink-0 px-8" aria-hidden="true">
            {tickerItem}
          </div>
        </div>
      </div>
    </div>
  )
}
