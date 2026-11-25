'use client'

import { useState } from 'react'
import { METRO_HUBS } from '@/data/store-matrix'
import { playCanOpenSound, playTabSound } from '@/lib/sound'
import {
  MapPinIcon,
  CheckIcon,
  RotateCcwIcon,
  LoaderIcon,
  CrosshairIcon,
  TrophyIcon,
  ArrowRightIcon,
} from '@/components/Icons'

interface CoordinateLockProps {
  onLockGps: () => void
  onUnlockGps?: () => void
  onSelectHub: (hubKey: string) => void
  onZipSubmit: (zip: string) => void
  onOpenSchematic: () => void
  isLocating?: boolean
  locked?: boolean
  gpsError?: string | null
  zipWarning?: string | null
  locationLabel?: string
  currentHub?: string
}

export default function CoordinateLock({
  onLockGps,
  onUnlockGps,
  onSelectHub,
  onZipSubmit,
  onOpenSchematic,
  isLocating = false,
  locked = false,
  gpsError = null,
  zipWarning = null,
  locationLabel = 'Denver Metro',
  currentHub,
}: CoordinateLockProps) {
  const [zipInput, setZipInput] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)

  const handleZip = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = zipInput.trim()
    if (/^\d{5}$/.test(clean)) {
      setZipError(null)
      playTabSound()
      onZipSubmit(clean)
    } else {
      setZipError('Enter a full 5-digit US ZIP code.')
    }
  }

  const handleLock = () => {
    setZipError(null)
    playCanOpenSound()
    onLockGps()
  }

  const handleUnlock = () => {
    setZipError(null)
    playTabSound()
    if (onUnlockGps) {
      onUnlockGps()
    } else {
      onLockGps()
    }
  }

  return (
    <section
      aria-labelledby="location-section-title"
      className="flex flex-col items-center gap-5 mb-6 md:mb-8"
    >
      <div className="glass-card p-5 sm:p-6 w-full max-w-2xl flex flex-col gap-5">
        <div className="text-center">
          <h2
            id="location-section-title"
            className="font-mono text-xs uppercase tracking-widest text-dc-ink-secondary font-semibold"
          >
            LOCATION &amp; MARKET HUBS
          </h2>
          <p className="font-body text-xs sm:text-sm text-dc-ink-muted tracking-wide mt-1">
            Pin live pricing to nearby convenience stores, fountains, and grocery shelves.
          </p>
        </div>

        {/* Group 1: GPS Lock */}
        <div className="flex flex-col items-center gap-2.5 pt-4 border-t border-gray-200/70">
          {locked ? (
            <div className="flex items-center gap-2 flex-wrap justify-center w-full">
              <div
                role="status"
                aria-live="polite"
                className="inline-flex items-center justify-center flex-wrap gap-2 border-2 border-emerald-500/50 bg-emerald-50/85 backdrop-blur-sm rounded-xl px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-300 shadow-sm min-h-[48px] max-w-full"
              >
                <span className="inline-flex items-center gap-1.5 text-emerald-800 font-body text-xs sm:text-sm uppercase tracking-widest font-semibold text-center break-words">
                  <MapPinIcon className="w-4 h-4 text-emerald-700" />
                  <span>GPS LOCKED: {locationLabel}</span>
                </span>
                <CheckIcon className="w-4 h-4 text-emerald-700 motion-scale-in" />
              </div>
              <button
                type="button"
                onClick={handleUnlock}
                aria-label="Unlock GPS coordinates"
                className="px-4 py-2 min-h-[44px] min-w-[44px] border border-dc-border-control bg-white/80 hover:bg-white text-dc-ink-secondary hover:text-dc-ink rounded-xl font-mono text-xs uppercase tracking-wider transition-colors shadow-sm motion-safe:active:scale-95 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <RotateCcwIcon className="w-3.5 h-3.5" />
                  <span>UNLOCK</span>
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLock}
              disabled={isLocating}
              aria-label="Lock your coordinates using device GPS"
              className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] sm:min-h-[52px] border-2 border-dashed rounded-xl px-5 py-3.5 sm:px-6 sm:py-4 font-body text-xs sm:text-sm uppercase tracking-widest font-medium transition-all duration-200 motion-safe:active:scale-[0.98] shadow-sm ${
                isLocating
                  ? 'border-dc-border-control bg-gray-100/80 text-dc-ink-secondary cursor-wait'
                  : 'border-dc-crimson/40 hover:border-dc-crimson bg-white/40 hover:bg-dc-crimson/5 text-dc-crimson-text cursor-pointer'
              }`}
            >
              {isLocating ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CrosshairIcon className="w-4 h-4" />
              )}
              <span>{isLocating ? 'ACQUIRING GPS LOCK...' : 'LOCK MY EXACT COORDINATES'}</span>
            </button>
          )}

          {gpsError && (
            <div
              role="alert"
              className="w-full rounded-xl border border-dc-crimson/40 bg-red-50/95 px-4 py-3 text-center shadow-sm"
            >
              <p className="font-body text-xs text-dc-crimson-text font-medium leading-snug">
                {gpsError}
              </p>
              <button
                type="button"
                onClick={handleLock}
                disabled={isLocating}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg bg-dc-crimson hover:bg-dc-crimson-dark text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Group 2: Metro Hub Presets */}
        <div
          role="group"
          aria-label="Metro market hubs"
          className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200/70"
        >
          <span className="text-xs uppercase tracking-wider text-dc-ink-secondary font-mono font-semibold">
            Market Hubs
          </span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {Object.entries(METRO_HUBS).map(([key, hub]) => (
              <button
                key={key}
                type="button"
                aria-pressed={currentHub === key}
                onClick={() => {
                  setZipError(null)
                  playTabSound()
                  onSelectHub(key)
                }}
                aria-label={`Switch market hub to ${hub.name} (${hub.zip})`}
                className={`px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-lg text-xs font-mono transition-all motion-safe:active:scale-95 shadow-sm cursor-pointer ${
                  currentHub === key
                    ? 'bg-dc-crimson text-white font-bold border border-dc-crimson'
                    : 'bg-white/70 hover:bg-white border border-dc-border-control hover:border-dc-crimson/60 text-dc-ink hover:text-dc-crimson-text'
                }`}
              >
                {hub.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Group 3: Custom ZIP Override */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200/70">
          <form onSubmit={handleZip} noValidate className="flex items-center justify-center gap-2 flex-wrap">
            <label
              htmlFor="zip-input"
              className="text-xs uppercase tracking-wider text-dc-ink-secondary font-mono font-semibold"
            >
              ZIP Code:
            </label>
            <input
              id="zip-input"
              type="text"
              maxLength={5}
              pattern="[0-9]{5}"
              inputMode="numeric"
              placeholder="80203"
              aria-label="5-digit US ZIP code"
              aria-invalid={Boolean(zipError)}
              aria-describedby={zipError ? 'zip-format-hint zip-error' : 'zip-format-hint'}
              value={zipInput}
              onChange={(e) => {
                setZipInput(e.target.value.replace(/[^0-9]/g, ''))
                if (zipError) setZipError(null)
              }}
              className="w-28 min-h-[44px] px-3 py-2 bg-white/80 border border-dc-border-control rounded-lg text-base font-mono text-center text-dc-black placeholder:text-dc-ink-muted focus:border-dc-crimson"
            />
            <button
              type="submit"
              className="px-4 py-2 min-h-[44px] min-w-[44px] bg-dc-black hover:bg-dc-crimson text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors motion-safe:active:scale-95 shadow-sm cursor-pointer"
            >
              GO
            </button>
          </form>

          <p id="zip-format-hint" className="text-xs font-body text-dc-ink-muted text-center">
            5-digit US ZIP (live King Soopers shelf feed in CO; regional baselines elsewhere).
          </p>

          {zipError && (
            <p
              id="zip-error"
              role="alert"
              className="text-xs font-body font-medium text-dc-crimson-text text-center"
            >
              {zipError}
            </p>
          )}

          {zipWarning && !zipError && (
            <div
              role="status"
              className="w-full rounded-xl border border-amber-500/40 bg-amber-50/95 px-4 py-2.5 text-center"
            >
              <p className="font-body text-xs text-dc-gold-text font-medium leading-snug">
                {zipWarning}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* McDonald's Schematic Button */}
      <button
        type="button"
        onClick={onOpenSchematic}
        aria-label="View McDonald's 34-degree gold standard engineering schematic"
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-dc-gold-text font-body text-xs uppercase tracking-wider font-semibold transition-all motion-safe:active:scale-[0.98] shadow-sm cursor-pointer text-center"
      >
        <TrophyIcon className="w-4 h-4" />
        <span>MCDONALD&apos;S GOLD STANDARD: VIEW 34°F CLOSED-LOOP SCHEMATIC</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </section>
  )
}
