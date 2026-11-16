'use client'

import { useState } from 'react'
import { METRO_HUBS } from '@/data/store-matrix'
import { playCanOpenSound, playTabSound } from '@/lib/sound'

interface CoordinateLockProps {
  onLockGps: () => void
  onSelectHub: (hubKey: string) => void
  onZipSubmit: (zip: string) => void
  onOpenSchematic: () => void
  isLocating?: boolean
  currentHub?: string
}

export default function CoordinateLock({
  onLockGps,
  onSelectHub,
  onZipSubmit,
  onOpenSchematic,
  isLocating,
  currentHub,
}: CoordinateLockProps) {
  const [zipInput, setZipInput] = useState('')

  const handleZip = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipInput.trim().length === 5) {
      playTabSound()
      onZipSubmit(zipInput.trim())
    }
  }

  const handleLock = () => {
    playCanOpenSound()
    onLockGps()
  }

  return (
    <div className="flex flex-col items-center gap-3.5 mb-12 md:mb-16">
      <div className="flex flex-col items-center gap-2.5 w-full max-w-lg">
        {/* GPS Lock Button */}
        <button
          type="button"
          onClick={handleLock}
          disabled={isLocating}
          aria-label="Lock your coordinates using device GPS"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] sm:min-h-[52px] border-2 border-dashed rounded-xl px-5 py-3.5 sm:px-6 sm:py-4 font-body text-xs sm:text-sm uppercase tracking-widest font-medium transition-all duration-200 active:scale-[0.98] shadow-sm border-dc-crimson/40 hover:border-dc-crimson bg-white/40 hover:bg-dc-crimson/5 text-dc-crimson cursor-pointer disabled:opacity-50"
        >
          <span>🎯</span>
          <span>{isLocating ? 'TRIANGULATING SATELLITES...' : 'LOCK MY EXACT COORDINATES'}</span>
        </button>

        {/* Quick Hubs */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Hubs:</span>
          {Object.entries(METRO_HUBS).map(([key, hub]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                playTabSound()
                onSelectHub(key)
              }}
              title={`Switch to ${hub.name} (${hub.zip})`}
              aria-label={`Switch market hub to ${hub.name}`}
              className={`px-2.5 py-1 min-h-[30px] rounded-md text-[11px] font-mono transition-all active:scale-95 shadow-2xs cursor-pointer ${
                currentHub === key
                  ? 'bg-dc-crimson text-white font-bold border border-dc-crimson'
                  : 'bg-white/60 hover:bg-white border border-gray-200/90 hover:border-dc-crimson/60 text-gray-600 hover:text-dc-crimson'
              }`}
            >
              {hub.name.split(',')[0]}
            </button>
          ))}
        </div>

        {/* Zip Code Input */}
        <form onSubmit={handleZip} className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
            King Soopers Zip:
          </span>
          <input
            id="zip-input"
            type="text"
            maxLength={5}
            pattern="[0-9]{5}"
            inputMode="numeric"
            placeholder="80203"
            aria-label="5-digit zip code for King Soopers"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            className="w-16 px-2 py-1 bg-white/70 border border-gray-300 rounded text-xs font-mono text-center text-dc-black focus:outline-none focus:border-dc-crimson"
          />
          <button
            type="submit"
            className="px-2.5 py-1 min-h-[28px] bg-dc-black hover:bg-dc-crimson text-white rounded text-[11px] font-mono uppercase tracking-wider transition-colors active:scale-95 shadow-2xs cursor-pointer"
          >
            GO
          </button>
        </form>

        <span className="font-body text-[11px] text-gray-500 tracking-wide text-center">
          Snaps live pricing to convenience stores and fountains within striking distance.
        </span>
      </div>

      {/* McDonald's Schematic Button */}
      <button
        type="button"
        onClick={onOpenSchematic}
        aria-label="View McDonald's 34-degree gold standard engineering schematic"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 font-body text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
      >
        <span>🏆</span>
        <span>MCDONALD&apos;S GOLD STANDARD: VIEW 34°F CLOSED-LOOP SCHEMATIC ➔</span>
      </button>
    </div>
  )
}
