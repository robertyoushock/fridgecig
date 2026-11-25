'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BurnResult } from '@/types'
import { playSuccessSound } from '@/lib/sound'
import {
  FlameIcon,
  TrophyIcon,
  ArrowRightIcon,
  WalkIcon,
  BoltIcon,
  MapPinIcon,
  TargetIcon,
} from '@/components/Icons'

interface BurnCardProps {
  data: BurnResult | null
  loading: boolean
  overridePrice?: number | null
  onOpenSchematic?: () => void
  onPriceOverride?: (price: number) => void
  onClearOverride?: () => void
  onSnitchOpenChange?: (open: boolean) => void
}

function BurnSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 md:p-8 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-32 bg-dc-silver-dark/35 rounded-full" />
      <div className="h-16 sm:h-20 w-44 bg-dc-silver-dark/35 rounded-lg mx-auto" />
      <div className="h-4 w-52 bg-dc-silver-dark/35 rounded mx-auto" />
      <div className="flex gap-2 justify-center">
        <div className="h-7 w-24 bg-dc-silver-dark/35 rounded-full" />
        <div className="h-7 w-28 bg-dc-silver-dark/35 rounded-full" />
      </div>
      <div className="h-12 w-full bg-dc-silver-dark/35 rounded-xl mt-2" />
    </div>
  )
}

function parseSizeOz(size: string): number {
  const match = size.match(/(\d+(?:\.\d+)?)\s*oz/i)
  return match ? parseFloat(match[1]) : 12
}

const METRIC_DEFINITIONS: Record<string, string> = {
  unit_cost: 'Liquid unit cost per fluid ounce for this single-serve option.',
  transit_time: 'Estimated walking time from your pinned coordinates at 3.1 mph.',
  vessel_format: 'Serving format and delivery vessel for this price.',
  vs_bottle: 'Percentage difference per ounce compared to a $2.99 20oz retail bottle ($0.150/oz).',
}

export default function BurnCard({
  data,
  loading,
  overridePrice = null,
  onOpenSchematic,
  onPriceOverride,
  onClearOverride,
  onSnitchOpenChange,
}: BurnCardProps) {
  const [snitchOpen, setSnitchOpen] = useState(false)
  const [snitchInput, setSnitchInput] = useState('')
  const [snitchError, setSnitchError] = useState<string | null>(null)
  const [snitchSuccess, setSnitchSuccess] = useState(false)
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  const snitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardBodyRef = useRef<HTMLDivElement | null>(null)
  const snitchDialogRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (snitchTimerRef.current) {
        clearTimeout(snitchTimerRef.current)
        snitchTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    onSnitchOpenChange?.(snitchOpen)
  }, [snitchOpen, onSnitchOpenChange])

  useEffect(() => {
    const bodyEl = cardBodyRef.current as (HTMLDivElement & { inert?: boolean }) | null
    if (bodyEl) {
      bodyEl.inert = snitchOpen
      if (snitchOpen) {
        bodyEl.setAttribute('aria-hidden', 'true')
      } else {
        bodyEl.removeAttribute('aria-hidden')
      }
    }
  }, [snitchOpen])

  const closeSnitch = useCallback(() => {
    if (snitchTimerRef.current) {
      clearTimeout(snitchTimerRef.current)
      snitchTimerRef.current = null
    }
    setSnitchOpen(false)
    setSnitchError(null)
    setSnitchSuccess(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!snitchOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSnitch()
        return
      }
      if (e.key === 'Tab' && snitchDialogRef.current) {
        const focusable = Array.from(
          snitchDialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'))
        if (focusable.length === 0) {
          e.preventDefault()
          snitchDialogRef.current.focus()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (!active || !focusable.includes(active)) {
          e.preventDefault()
          ;(e.shiftKey ? last : first).focus()
        } else if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [snitchOpen, closeSnitch])

  useEffect(() => {
    if (!snitchOpen || !snitchSuccess) return
    snitchDialogRef.current?.focus()
  }, [snitchOpen, snitchSuccess])

  if (loading || !data) return <BurnSkeleton />

  const hasOverride = typeof overridePrice === 'number' && Number.isFinite(overridePrice)
  const activePrice = hasOverride ? overridePrice : data.price
  const oz = parseSizeOz(data.size)
  const activeUnitCostPerOz = hasOverride
    ? Math.round((activePrice / oz) * 1000) / 1000
    : data.unit_cost_per_oz
  const formattedPrice = `$${activePrice.toFixed(2)}`
  const bottleUnitOz = 2.99 / 20
  const activeVsBottle = hasOverride
    ? Math.round(((activePrice / oz - bottleUnitOz) / bottleUnitOz) * 1000) / 10
    : data.vs_bottle_spread ??
      Math.round(((data.unit_cost_per_oz - bottleUnitOz) / bottleUnitOz) * 1000) / 10

  const openSnitch = () => {
    if (snitchTimerRef.current) {
      clearTimeout(snitchTimerRef.current)
      snitchTimerRef.current = null
    }
    setSnitchError(null)
    setSnitchSuccess(false)
    setSnitchInput('')
    setSnitchOpen(true)
  }

  const handleSnitchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = snitchInput.trim()
    const num = Number(trimmed)
    if (!trimmed || Number.isNaN(num) || !Number.isFinite(num) || num < 0.1 || num > 50) {
      setSnitchError('Enter a valid price between $0.10 and $50.00.')
      inputRef.current?.focus()
      return
    }

    const rounded = Math.round(num * 100) / 100
    setSnitchError(null)
    onPriceOverride?.(rounded)
    playSuccessSound()
    setSnitchSuccess(true)

    if (snitchTimerRef.current) {
      clearTimeout(snitchTimerRef.current)
      snitchTimerRef.current = null
    }
    snitchTimerRef.current = setTimeout(() => {
      snitchTimerRef.current = null
      setSnitchSuccess(false)
      setSnitchOpen(false)
      setSnitchInput('')
      requestAnimationFrame(() => triggerRef.current?.focus())
    }, 1500)
  }

  const toggleMetric = (id: string) => {
    setExpandedMetric((prev) => (prev === id ? null : id))
  }

  const primaryMapsUrl = data.google_maps_url || data.maps_url

  return (
    <div className="glass-card relative p-5 sm:p-6 md:p-8 flex flex-col">
      <div ref={cardBodyRef} className="flex flex-col gap-4 sm:gap-5 flex-1">
        {/* Header Badge */}
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="inline-flex items-center gap-1.5 bg-dc-crimson/10 text-dc-crimson-text px-3 py-1 rounded-full font-body text-xs uppercase tracking-widest font-semibold">
              <FlameIcon className="w-3.5 h-3.5" />
              <span>THE BURN</span>
            </h2>
            <span className="hidden sm:inline-block font-body text-xs text-dc-ink-muted uppercase tracking-widest">
              Immediate Single
            </span>
          </div>

          {data.gold_standard && onOpenSchematic && (
            <button
              type="button"
              onClick={onOpenSchematic}
              aria-label="Gold Standard — view McDonald's 34°F closed-loop fountain schematic"
              className="inline-flex items-center gap-1.5 min-h-[44px] bg-amber-500/15 border border-amber-500/30 text-dc-gold-text px-3 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <TrophyIcon className="w-3.5 h-3.5" />
              <span>GOLD STANDARD</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* MASSIVE PRICE */}
        <div className="text-center py-1 sm:py-2">
          <span className="font-display text-[clamp(2.75rem,13vw,6rem)] text-dc-black leading-none tracking-tight whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>

        {/* Product & Store info */}
        <div className="text-center px-2">
          <p className="font-body text-xs sm:text-sm text-dc-ink-secondary font-medium text-pretty break-words">
            {data.size} • {data.store_name} ({data.distance_mi} mi away)
          </p>
          <p className="font-mono text-xs text-dc-ink-muted mt-0.5 inline-flex items-center justify-center gap-1">
            <WalkIcon className="w-3.5 h-3.5" />
            <span>~{data.walk_time_mins} min walk ({data.distance_mi} mi)</span>
          </p>
        </div>

        {/* Snitch Trigger & Session Override Status */}
        <div className="flex flex-col items-center gap-1.5 -mt-2">
          <button
            ref={triggerRef}
            type="button"
            onClick={openSnitch}
            className="text-xs font-body text-dc-ink-muted hover:text-dc-crimson-text underline underline-offset-4 transition-colors uppercase tracking-wider py-2 px-3 min-h-[44px] inline-flex items-center justify-center cursor-pointer"
          >
            Price wrong? Snitch here.
          </button>

          {hasOverride && (
            <div className="inline-flex items-center gap-2 flex-wrap justify-center bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-dc-gold-text font-semibold">
                Session override active
              </span>
              {onClearOverride && (
                <button
                  type="button"
                  onClick={onClearOverride}
                  aria-label="Reset session price override"
                  className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-full bg-white hover:bg-dc-silver-light border border-dc-border-control text-dc-ink hover:text-dc-crimson-text font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Serving Format Callout (divider-styled, no 4-sided nested border box) */}
        {data.gold_standard ? (
          <div className="bg-amber-500/10 border-y border-amber-500/25 px-3.5 py-2 text-center">
            <p className="font-body text-xs sm:text-sm font-semibold text-dc-gold-text text-pretty break-words">
              <TrophyIcon className="w-4 h-4 inline-block align-[-2px] mr-1.5" />
              34°F Closed-Loop Gold Standard — recirculating chiller &amp; stainless syrup cells
            </p>
          </div>
        ) : (
          <div className="bg-dc-silver-light/70 border-y border-gray-200/80 px-3.5 py-2 text-center">
            <p className="font-body text-xs sm:text-sm font-semibold text-dc-ink-secondary text-pretty break-words">
              <BoltIcon className="w-4 h-4 inline-block align-[-2px] mr-1 text-dc-crimson-text" />
              Best Immediate Single-Serve — {Math.abs(activeVsBottle).toFixed(1)}% {activeVsBottle <= 0 ? 'cheaper' : 'more'} per oz vs. $2.99 20oz bottle
            </p>
          </div>
        )}

        {/* FINANCIAL METRICS */}
        <div className="space-y-0">
          <div className="border-b border-gray-200/60">
            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                aria-expanded={expandedMetric === 'unit_cost'}
                aria-controls="burn-def-unit_cost"
                onClick={() => toggleMetric('unit_cost')}
                className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
              >
                <span>UNIT COST</span>
                <span className="text-[11px] font-mono" aria-hidden="true">?</span>
              </button>
              <span className="font-body text-xs tabular-nums font-medium text-dc-black">
                ${activeUnitCostPerOz.toFixed(3)} / OZ
              </span>
            </div>
            {expandedMetric === 'unit_cost' && (
              <p id="burn-def-unit_cost" className="pb-2 text-xs font-body text-dc-ink-secondary">
                {METRIC_DEFINITIONS.unit_cost}
              </p>
            )}
          </div>

          <div className="border-b border-gray-200/60">
            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                aria-expanded={expandedMetric === 'transit_time'}
                aria-controls="burn-def-transit_time"
                onClick={() => toggleMetric('transit_time')}
                className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
              >
                <span>TRANSIT TIME</span>
                <span className="text-[11px] font-mono" aria-hidden="true">?</span>
              </button>
              <span className="font-body text-xs tabular-nums font-medium text-dc-black">
                {data.walk_time_mins} MIN WALK
              </span>
            </div>
            {expandedMetric === 'transit_time' && (
              <p id="burn-def-transit_time" className="pb-2 text-xs font-body text-dc-ink-secondary">
                {METRIC_DEFINITIONS.transit_time}
              </p>
            )}
          </div>

          <div className="border-b border-gray-200/60">
            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                aria-expanded={expandedMetric === 'vessel_format'}
                aria-controls="burn-def-vessel_format"
                onClick={() => toggleMetric('vessel_format')}
                className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
              >
                <span>VESSEL FORMAT</span>
                <span className="text-[11px] font-mono" aria-hidden="true">?</span>
              </button>
              <span className="font-body text-xs tabular-nums font-semibold text-dc-crimson-text text-right break-words">
                {data.size.toUpperCase()}
              </span>
            </div>
            {expandedMetric === 'vessel_format' && (
              <p id="burn-def-vessel_format" className="pb-2 text-xs font-body text-dc-ink-secondary">
                {METRIC_DEFINITIONS.vessel_format}
              </p>
            )}
          </div>

          <div className="border-b border-gray-200/60">
            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                aria-expanded={expandedMetric === 'vs_bottle'}
                aria-controls="burn-def-vs_bottle"
                onClick={() => toggleMetric('vs_bottle')}
                className="min-h-[44px] inline-flex items-center gap-1 text-left font-body text-xs uppercase tracking-wider text-dc-ink-muted hover:text-dc-ink underline decoration-dotted underline-offset-4 cursor-pointer"
              >
                <span>VS. 20OZ BOTTLE</span>
                <span className="text-[11px] font-mono" aria-hidden="true">?</span>
              </button>
              <span
                className={`font-body text-xs tabular-nums font-semibold ${
                  activeVsBottle <= 0 ? 'text-dc-positive' : 'text-dc-crimson-text'
                }`}
              >
                {activeVsBottle > 0 ? '+' : ''}
                {activeVsBottle}% SPREAD
              </span>
            </div>
            {expandedMetric === 'vs_bottle' && (
              <p id="burn-def-vs_bottle" className="pb-2 text-xs font-body text-dc-ink-secondary">
                {METRIC_DEFINITIONS.vs_bottle}
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
              {data.runner_up.store_name} — {data.runner_up.size} ({data.runner_up.formatted_price}, ${data.runner_up.unit_cost_per_oz.toFixed(3)}/oz)
            </p>
          </div>
        )}

        {/* Route Action & Maps Selector */}
        <div className="mt-auto pt-1 flex flex-col gap-2">
          <a
            href={primaryMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get walking directions to ${data.store_name} in Google Maps`}
            className="block w-full bg-dc-black hover:bg-black text-white font-display text-base sm:text-lg text-center py-3 px-4 min-h-[48px] rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm motion-safe:active:scale-[0.99]"
          >
            <MapPinIcon className="w-4 h-4" />
            <span>[ ROUTE TO {data.store_name.toUpperCase()} ]</span>
          </a>

          {/* Quick Maps App Links */}
          <div className="flex items-center justify-center gap-2 pt-0.5 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-dc-ink-muted font-mono">
              Open in:
            </span>
            <a
              href={data.apple_maps_url || data.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open directions to ${data.store_name} in Apple Maps`}
              className="inline-flex items-center justify-center px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-lg text-xs font-mono border border-dc-border-control bg-white/60 hover:bg-white text-dc-ink hover:text-dc-crimson-text transition-colors duration-150"
            >
              Apple Maps
            </a>
            <a
              href={data.google_maps_url || data.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open directions to ${data.store_name} in Google Maps`}
              className="inline-flex items-center justify-center px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-lg text-xs font-mono border border-dc-border-control bg-white/60 hover:bg-white text-dc-ink hover:text-dc-crimson-text transition-colors duration-150"
            >
              Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Snitch Modal Overlay */}
      {snitchOpen && (
        <div
          ref={snitchDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="snitch-title"
          tabIndex={-1}
          className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 z-20 flex flex-col justify-center items-center text-center shadow-xl motion-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {snitchSuccess ? (
            <div className="space-y-2">
              <TargetIcon size={32} className="w-8 h-8 mx-auto text-dc-positive" />
              <p className="font-display text-2xl text-dc-positive">INTEL LOGGED.</p>
              <p className="font-body text-sm text-dc-ink-secondary uppercase tracking-wider">
                Spot price overridden in local session.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSnitchSubmit} noValidate className="w-full max-w-xs space-y-4">
              <div className="space-y-1">
                <h2 id="snitch-title" className="font-display text-xl text-dc-black block">
                  SNITCH ON STORE PRICING
                </h2>
                <p className="font-body text-sm text-dc-ink-secondary text-pretty">
                  Spotted a different price at {data.store_name} ({data.size})?
                </p>
              </div>

              <div>
                <label
                  htmlFor="snitch-price-input"
                  className="block text-xs font-body uppercase tracking-wider text-dc-ink-secondary mb-1"
                >
                  Observed Price ($ USD)
                </label>
                <div className="relative flex items-center">
                  <span
                    aria-hidden="true"
                    className="absolute left-3.5 font-display text-2xl text-dc-ink-muted pointer-events-none select-none"
                  >
                    $
                  </span>
                  <input
                    ref={inputRef}
                    id="snitch-price-input"
                    type="number"
                    step="0.01"
                    min="0.10"
                    max="50.00"
                    inputMode="decimal"
                    placeholder="0.99"
                    value={snitchInput}
                    aria-invalid={Boolean(snitchError)}
                    aria-describedby={snitchError ? 'snitch-scope-hint snitch-error' : 'snitch-scope-hint'}
                    onChange={(e) => {
                      setSnitchInput(e.target.value)
                      if (snitchError) setSnitchError(null)
                    }}
                    className="w-full text-center font-display text-3xl bg-dc-silver-light/80 border border-dc-border-control rounded-lg py-2 pl-9 pr-4 text-dc-black placeholder:text-dc-ink-muted focus:border-dc-crimson"
                  />
                </div>
                <p id="snitch-scope-hint" className="mt-1.5 text-xs font-mono text-dc-ink-muted text-pretty">
                  Local session override for {data.store_name} ({data.size}). Resets on hub, ZIP, filter, or refresh.
                </p>
                {snitchError && (
                  <p
                    id="snitch-error"
                    role="alert"
                    className="mt-1.5 font-body text-xs font-medium text-dc-crimson-text"
                  >
                    {snitchError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeSnitch}
                  className="w-1/3 py-2 border border-dc-border-control text-dc-ink-secondary font-body text-xs uppercase tracking-wider rounded-lg hover:bg-gray-50 min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-dc-crimson hover:bg-dc-crimson-dark text-white font-body font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors min-h-[44px] cursor-pointer"
                >
                  Update Price
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
