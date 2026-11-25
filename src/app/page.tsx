'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Coordinates, PuristMode, IndexData } from '@/types'
import { DENVER_DEFAULT_COORDS, METRO_HUBS } from '@/data/store-matrix'
import { getIndexData, resolveZipTarget } from '@/lib/pricing'
import { fetchLiveKrogerPricing, mergeLiveStash } from '@/lib/kroger'
import { getUserCoordinates } from '@/lib/geolocation'
import {
  isMuted,
  toggleMute,
  playCanOpenSound,
  playTabSound,
  playSuccessSound,
} from '@/lib/sound'

import TickerTape from '@/components/TickerTape'
import PuristFilter from '@/components/PuristFilter'
import BurnCard from '@/components/BurnCard'
import StashCard from '@/components/StashCard'
import CoordinateLock from '@/components/CoordinateLock'
import CondensationDroplets from '@/components/CondensationDroplets'
import GoldStandardSchematic from '@/components/GoldStandardSchematic'
import SeekHelpModal from '@/components/SeekHelpModal'
import Colophon from '@/components/Colophon'
import {
  RefreshIcon,
  VolumeOnIcon,
  VolumeOffIcon,
  ClipboardIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  MapPinIcon,
} from '@/components/Icons'

function parseSizeOz(size: string): number {
  const match = size.match(/(\d+(?:\.\d+)?)\s*oz/i)
  return match ? parseFloat(match[1]) : 12
}

export default function Home() {
  const [coords, setCoords] = useState<Coordinates>(DENVER_DEFAULT_COORDS)
  const [currentHub, setCurrentHub] = useState<string>('denver')
  const [puristMode, setPuristMode] = useState<PuristMode>('anything')
  const [currentZip, setCurrentZip] = useState<string | undefined>('80203')
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [locked, setLocked] = useState<boolean>(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [zipWarning, setZipWarning] = useState<string | null>(null)
  const [isSchematicOpen, setIsSchematicOpen] = useState<boolean>(false)
  const [isBannedModalOpen, setIsBannedModalOpen] = useState<boolean>(false)
  const [isSnitchOpen, setIsSnitchOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [muted, setMutedState] = useState<boolean>(false)
  const [updatedAt, setUpdatedAt] = useState<string>('JUST NOW')
  const [burnOverride, setBurnOverride] = useState<{ key: string; price: number } | null>(null)
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('')

  const requestIdRef = useRef<number>(0)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const appShellRef = useRef<HTMLDivElement | null>(null)

  const announce = useCallback((msg: string) => {
    setStatusAnnouncement('')
    requestAnimationFrame(() => setStatusAnnouncement(msg))
  }, [])

  useEffect(() => {
    setMutedState(isMuted())
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const shellEl = appShellRef.current as (HTMLDivElement & { inert?: boolean }) | null
    const modalOpen = isSchematicOpen || isBannedModalOpen
    if (shellEl) {
      shellEl.inert = modalOpen
      if (modalOpen) {
        shellEl.setAttribute('aria-hidden', 'true')
      } else {
        shellEl.removeAttribute('aria-hidden')
      }
    }
  }, [isSchematicOpen, isBannedModalOpen])

  const closeSchematic = useCallback(() => setIsSchematicOpen(false), [])
  const closeBannedModal = useCallback(() => setIsBannedModalOpen(false), [])

  // Core pricing update function
  const updatePrices = useCallback(
    async (
      targetCoords: Coordinates,
      mode: PuristMode,
      targetZip?: string,
      skipSound = false,
      announcementPrefix?: string,
    ) => {
      const reqId = ++requestIdRef.current
      setLoading(true)
      if (!skipSound) {
        playCanOpenSound()
      }

      // Compute immediate base index
      const baseIndex = getIndexData(targetCoords.lat, targetCoords.lng, mode, targetZip)
      setIndexData(baseIndex)
      const nextTime = skipSound
        ? 'JUST NOW'
        : new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
          })
      setUpdatedAt(nextTime)
      setLoading(false)

      if (announcementPrefix) {
        announce(announcementPrefix.replace('{burn}', `${baseIndex.burn.formatted_price} at ${baseIndex.burn.store_name}`).replace('{stash}', `${baseIndex.stash.formatted_price} at ${baseIndex.stash.store_name}`).replace('{location}', baseIndex.location_label).replace('{size}', baseIndex.burn.size).replace('{time}', nextTime))
      } else if (skipSound) {
        announce(
          `Loaded Diet Coke Index for ${baseIndex.location_label}. Best burn: ${baseIndex.burn.formatted_price} at ${baseIndex.burn.store_name}. Best stash: ${baseIndex.stash.formatted_price} at ${baseIndex.stash.store_name}.`
        )
      }

      // Background live shelf pricing enrichment (Kroger / King Soopers)
      setIsRefreshing(true)
      try {
        const liveStash = await fetchLiveKrogerPricing(
          targetCoords.lat,
          targetCoords.lng,
          targetZip
        )
        if (reqId === requestIdRef.current && liveStash) {
          const merged = mergeLiveStash(baseIndex.stash, liveStash)
          setIndexData((prev) => (prev ? { ...prev, stash: merged } : null))
          if (merged.is_live_api) {
            announce(`Live shelf feed updated for ${merged.store_name}: ${merged.formatted_price}.`)
          }
        }
      } catch {
        // Fallback maintained
      } finally {
        if (reqId === requestIdRef.current) {
          setIsRefreshing(false)
        }
      }
    },
    [announce]
  )

  // Initial load
  useEffect(() => {
    updatePrices(DENVER_DEFAULT_COORDS, 'anything', '80203', true)
  }, [updatePrices])

  // Handle Purist mode changes
  const handleModeChange = useCallback(
    (newMode: PuristMode) => {
      setPuristMode(newMode)
      setBurnOverride(null)
      updatePrices(
        coords,
        newMode,
        currentZip,
        false,
        `Filter set to ${newMode}. Burn: {burn} ({size}).`
      )
    },
    [coords, currentZip, updatePrices]
  )

  // Handle Hub switches
  const handleHubSelect = useCallback(
    (hubKey: string) => {
      const hub = METRO_HUBS[hubKey]
      if (hub) {
        setLocked(false)
        setGpsError(null)
        setZipWarning(null)
        setBurnOverride(null)
        setCurrentHub(hubKey)
        setCoords(hub.coords)
        setCurrentZip(hub.zip)
        updatePrices(
          hub.coords,
          puristMode,
          hub.zip,
          false,
          `Switched market hub to ${hub.name}. Burn {burn}, Stash {stash}.`
        )
      }
    },
    [puristMode, updatePrices]
  )

  const handleUnlockGps = useCallback(() => {
    setLocked(false)
    setGpsError(null)
    announce('GPS unlocked.')
  }, [announce])

  // Handle GPS coordinate lock / unlock
  const handleLockGps = useCallback(async () => {
    if (locked) {
      handleUnlockGps()
      return
    }
    if (isLocating) return

    setIsLocating(true)
    setGpsError(null)
    setZipWarning(null)
    announce('Acquiring GPS coordinates...')
    try {
      const userCoords = await getUserCoordinates()
      setCoords(userCoords)
      setCurrentHub('')
      setCurrentZip(undefined)
      setBurnOverride(null)
      setLocked(true)
      await updatePrices(
        userCoords,
        puristMode,
        undefined,
        false,
        'GPS locked to {location}. Prices updated. Burn {burn}, Stash {stash}.'
      )
    } catch (err) {
      setLocked(false)
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to determine your location. Choose a market hub or enter a ZIP code.'
      setGpsError(msg)
      announce(`Location error: ${msg}`)
    } finally {
      setIsLocating(false)
    }
  }, [locked, isLocating, puristMode, updatePrices, handleUnlockGps, announce])

  // Handle Zip code submission
  const handleZipSubmit = useCallback(
    (zip: string) => {
      const resolved = resolveZipTarget(zip)
      setLocked(false)
      setGpsError(null)
      setZipWarning(resolved.warning)
      setBurnOverride(null)
      setCurrentHub(resolved.hubKey)
      setCoords(resolved.coords)
      setCurrentZip(resolved.zip)
      const suffix = resolved.warning ? ` ${resolved.warning}` : ''
      updatePrices(
        resolved.coords,
        puristMode,
        resolved.zip,
        false,
        `Updated pricing for ZIP ${resolved.zip} ({location}). Burn {burn}, Stash {stash}.${suffix}`
      )
    },
    [puristMode, updatePrices]
  )

  // Manual refresh button / hotkey
  const handleManualRefresh = useCallback(() => {
    setBurnOverride(null)
    playCanOpenSound()
    updatePrices(
      coords,
      puristMode,
      currentZip,
      true,
      'Prices refreshed at {time}. Burn {burn}, Stash {stash}.'
    )
    setUpdatedAt(
      new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    )
  }, [coords, puristMode, currentZip, updatePrices])

  const overrideKey = indexData
    ? `${indexData.burn.store_name}|${indexData.burn.size}|${indexData.location_label}`
    : ''

  const effectiveIndexData: IndexData | null = useMemo(() => {
    if (!indexData) return null
    if (!burnOverride || burnOverride.key !== overrideKey) return indexData

    const oz = parseSizeOz(indexData.burn.size)
    const effectivePrice = burnOverride.price
    const effectiveUnitOz = Math.round((effectivePrice / oz) * 1000) / 1000
    const bottleUnitOz = 2.99 / 20
    const effectiveVsBottle = Math.round(((effectivePrice / oz - bottleUnitOz) / bottleUnitOz) * 1000) / 10
    const effectiveSpreadPct = Math.round(((effectivePrice / oz - 1.75 / 12) / (1.75 / 12)) * 100)

    return {
      ...indexData,
      burn: {
        ...indexData.burn,
        price: effectivePrice,
        formatted_price: `$${effectivePrice.toFixed(2)}`,
        unit_cost_per_oz: effectiveUnitOz,
        vs_bottle_spread: effectiveVsBottle,
      },
      ticker: {
        ...indexData.ticker,
        spot_price_per_oz: effectiveUnitOz,
        fountain_spread_pct: effectiveSpreadPct,
      },
    }
  }, [indexData, burnOverride, overrideKey])

  const activeOverridePrice =
    burnOverride && burnOverride.key === overrideKey ? burnOverride.price : null

  const handlePriceOverride = useCallback(
    (price: number) => {
      if (!indexData) return
      setBurnOverride({ key: overrideKey, price })
      announce(`Spot price for ${indexData.burn.store_name} overridden to $${price.toFixed(2)} for this session.`)
    },
    [indexData, overrideKey, announce]
  )

  const handleClearOverride = useCallback(() => {
    if (!indexData) return
    setBurnOverride(null)
    announce(`Session price override cleared for ${indexData.burn.store_name}.`)
  }, [indexData, announce])

  // Share Spread to clipboard with non-silent fallback & error handling
  const handleShareSpread = async () => {
    if (!effectiveIndexData) return
    setCopied(false)
    setCopyError(null)

    const text = `🧊 THE DIET COKE INDEX\n📍 Sector: ${effectiveIndexData.location_label}\n🔥 The Burn: ${effectiveIndexData.burn.formatted_price} (${effectiveIndexData.burn.size} @ ${effectiveIndexData.burn.store_name})\n📦 The Stash: ${effectiveIndexData.stash.formatted_price} (${effectiveIndexData.stash.pack_desc} @ ${effectiveIndexData.stash.store_name})\n📊 Unit Cost: $${effectiveIndexData.stash.unit_cost_per_can.toFixed(2)}/can (${effectiveIndexData.stash.vs_bodega_spread}% spread vs bodega)\nhttps://robertyoushock.com/fridgecig/`

    let succeeded = false
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        succeeded = true
      }
    } catch {
      succeeded = false
    }

    if (!succeeded && typeof document !== 'undefined') {
      let textarea: HTMLTextAreaElement | null = null
      try {
        textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        succeeded = document.execCommand('copy')
      } catch {
        succeeded = false
      } finally {
        if (textarea && textarea.parentNode) {
          textarea.parentNode.removeChild(textarea)
        }
      }
    }

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)

    if (succeeded) {
      playSuccessSound()
      setCopied(true)
      announce('Arbitrage spread copied to clipboard.')
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } else {
      setCopyError('COPY FAILED')
      announce('Copy failed. Clipboard unavailable.')
      copyTimerRef.current = setTimeout(() => setCopyError(null), 3000)
    }
  }

  const handleToggleMute = () => {
    const nextMuted = toggleMute()
    setMutedState(nextMuted)
    if (!nextMuted) {
      playTabSound()
    }
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName
      if (
        activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        activeTag === 'SELECT' ||
        isSchematicOpen ||
        isBannedModalOpen ||
        isSnitchOpen
      ) {
        return
      }

      const key = e.key.toLowerCase()
      if (key === 'r') {
        e.preventDefault()
        handleManualRefresh()
      } else if (key === 'c') {
        e.preventDefault()
        handleModeChange('can')
      } else if (key === 'f') {
        e.preventDefault()
        handleModeChange('fountain')
      } else if (key === 'a') {
        e.preventDefault()
        handleModeChange('anything')
      } else if (key === 'l') {
        e.preventDefault()
        handleLockGps()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isSchematicOpen,
    isBannedModalOpen,
    isSnitchOpen,
    handleManualRefresh,
    handleModeChange,
    handleLockGps,
  ])

  return (
    <>
      <div ref={appShellRef} className="flex flex-col min-h-screen">
        {/* Real-time Ticker Tape */}
        {effectiveIndexData && (
          <TickerTape
            data={effectiveIndexData.ticker}
            locationLabel={effectiveIndexData.location_label}
          />
        )}

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-10">
          {/* Header & Controls */}
          <div className="text-center mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-dc-black text-white px-2.5 py-1.5 rounded text-[11px] uppercase tracking-[0.2em] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE ARBITRAGE DESK
              </span>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={handleManualRefresh}
                aria-label="Refresh price feeds manually (Key: R)"
                className="inline-flex items-center gap-1.5 min-h-[44px] border px-3 py-2 rounded text-[11px] uppercase tracking-wider font-mono transition-all motion-safe:active:scale-[0.96] border-dc-border-control hover:border-dc-crimson bg-white/60 hover:bg-white text-dc-ink hover:text-dc-crimson-text cursor-pointer"
              >
                <RefreshIcon
                  className={`w-3.5 h-3.5 ${loading || isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>REFRESH PRICES [R]</span>
              </button>

              {/* Share Spread Button */}
              <button
                type="button"
                onClick={handleShareSpread}
                aria-label="Copy Diet Coke Index arbitrage data to clipboard"
                className={`inline-flex items-center gap-1.5 min-h-[44px] border px-3 py-2 rounded text-[11px] uppercase tracking-wider font-mono transition-all motion-safe:active:scale-[0.96] cursor-pointer ${
                  copyError
                    ? 'border-dc-crimson bg-red-50 text-dc-crimson-text'
                    : 'border-dc-border-control hover:border-dc-crimson bg-white/50 hover:bg-white text-dc-ink hover:text-dc-crimson-text'
                }`}
              >
                {copyError ? (
                  <AlertTriangleIcon className="w-3.5 h-3.5" />
                ) : copied ? (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-dc-positive" />
                ) : (
                  <ClipboardIcon className="w-3.5 h-3.5" />
                )}
                <span>{copyError ?? (copied ? 'SPREAD COPIED' : 'SHARE SPREAD')}</span>
              </button>

              {/* Audio Mute Toggle */}
              <button
                type="button"
                onClick={handleToggleMute}
                aria-pressed={muted}
                aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
                className={`inline-flex items-center gap-1.5 min-h-[44px] border px-3 py-2 rounded text-[11px] uppercase tracking-wider font-mono transition-all motion-safe:active:scale-[0.96] cursor-pointer ${
                  muted
                    ? 'border-dc-crimson/50 bg-dc-crimson/10 text-dc-crimson-text'
                    : 'border-dc-border-control hover:border-dc-crimson bg-white/50 hover:bg-white text-dc-ink hover:text-dc-crimson-text'
                }`}
              >
                {muted ? (
                  <VolumeOffIcon className="w-3.5 h-3.5" />
                ) : (
                  <VolumeOnIcon className="w-3.5 h-3.5" />
                )}
                <span>{muted ? 'MUTED' : 'SOUND ON'}</span>
              </button>
            </div>

            {copyError && (
              <p role="status" className="text-xs font-mono text-dc-crimson-text mb-2">
                Clipboard unavailable in this browser — copy failed.
              </p>
            )}

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-dc-black tracking-tight mb-2">
              THE DIET COKE INDEX
            </h1>

            <p className="font-body text-xs sm:text-sm text-dc-ink-muted tracking-[0.18em] sm:tracking-[0.2em] uppercase mb-1">
              Real-time retail arbitrage intelligence.
            </p>

            <p className="font-body text-xs text-dc-ink-muted uppercase tracking-widest mb-6 text-pretty">
              <span>
                <MapPinIcon className="w-3.5 h-3.5 inline-block align-[-2px] mr-1 text-dc-crimson-text" />
                REGIONAL BENCHMARK: {effectiveIndexData?.location_label ?? 'DENVER METRO'}
              </span>
              <span className="mx-2 text-dc-ink-muted" aria-hidden="true">•</span>
              <span className="font-mono text-xs text-dc-ink-muted whitespace-nowrap">UPDATED {updatedAt}</span>
            </p>

            {/* Purist Filter & Banned 2L Warning */}
            <PuristFilter
              mode={puristMode}
              onChange={handleModeChange}
              onOpenBannedModal={() => setIsBannedModalOpen(true)}
            />
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
            <BurnCard
              data={effectiveIndexData?.burn ?? null}
              loading={loading}
              overridePrice={activeOverridePrice}
              onOpenSchematic={() => setIsSchematicOpen(true)}
              onPriceOverride={handlePriceOverride}
              onClearOverride={handleClearOverride}
              onSnitchOpenChange={setIsSnitchOpen}
            />
            <StashCard
              data={effectiveIndexData?.stash ?? null}
              loading={loading}
            />
          </div>

          {/* Coordinate Locking & Hub Selector */}
          <CoordinateLock
            onLockGps={handleLockGps}
            onUnlockGps={handleUnlockGps}
            onSelectHub={handleHubSelect}
            onZipSubmit={handleZipSubmit}
            onOpenSchematic={() => setIsSchematicOpen(true)}
            isLocating={isLocating}
            locked={locked}
            gpsError={gpsError}
            zipWarning={zipWarning}
            locationLabel={effectiveIndexData?.location_label ?? 'Denver Metro'}
            currentHub={currentHub}
          />
        </main>

        {/* Interactive Water Droplets Layer & In-flow Status Dock */}
        <CondensationDroplets />

        {/* Colophon / Nutrition Facts Footer */}
        <Colophon />
      </div>

      {/* Persistent Root Status Announcer */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusAnnouncement}
      </div>

      {/* McDonald's 34°F Closed-Loop Schematic Modal */}
      <GoldStandardSchematic
        isOpen={isSchematicOpen}
        onClose={closeSchematic}
      />

      {/* Banned 2-Liter Modal */}
      <SeekHelpModal
        isOpen={isBannedModalOpen}
        onClose={closeBannedModal}
      />
    </>
  )
}
