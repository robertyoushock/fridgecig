'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Coordinates, PuristMode, IndexData } from '@/types'
import { DENVER_DEFAULT_COORDS, METRO_HUBS } from '@/data/store-matrix'
import { getIndexData } from '@/lib/pricing'
import { fetchLiveKrogerPricing } from '@/lib/kroger'
import { getUserCoordinates } from '@/lib/geolocation'
import { playCanOpenSound, playTabSound, playSuccessSound } from '@/lib/sound'

import TickerTape from '@/components/TickerTape'
import PuristFilter from '@/components/PuristFilter'
import BurnCard from '@/components/BurnCard'
import StashCard from '@/components/StashCard'
import CoordinateLock from '@/components/CoordinateLock'
import CondensationDroplets from '@/components/CondensationDroplets'
import GoldStandardSchematic from '@/components/GoldStandardSchematic'
import SeekHelpModal from '@/components/SeekHelpModal'
import Colophon from '@/components/Colophon'

export default function Home() {
  const [coords, setCoords] = useState<Coordinates>(DENVER_DEFAULT_COORDS)
  const [currentHub, setCurrentHub] = useState<string>('denver')
  const [puristMode, setPuristMode] = useState<PuristMode>('anything')
  const [currentZip, setCurrentZip] = useState<string | undefined>('80203')
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [isSchematicOpen, setIsSchematicOpen] = useState<boolean>(false)
  const [isBannedModalOpen, setIsBannedModalOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [updatedAt, setUpdatedAt] = useState<string>('JUST NOW')

  // Core pricing update function
  const updatePrices = useCallback(
    async (
      targetCoords: Coordinates,
      mode: PuristMode,
      targetZip?: string,
      skipSound = false
    ) => {
      setLoading(true)
      if (!skipSound) {
        playCanOpenSound()
      }

      // Compute immediate base index
      const baseIndex = getIndexData(targetCoords.lat, targetCoords.lng, mode, targetZip)
      setIndexData(baseIndex)
      setUpdatedAt('JUST NOW')
      setLoading(false)

      // Background live shelf pricing enrichment (Kroger / King Soopers)
      try {
        const liveStash = await fetchLiveKrogerPricing(
          targetCoords.lat,
          targetCoords.lng,
          targetZip
        )
        if (liveStash) {
          setIndexData((prev) => (prev ? { ...prev, stash: liveStash } : null))
        }
      } catch (e) {
        // Fallback maintained
      }
    },
    []
  )

  // Initial load
  useEffect(() => {
    updatePrices(DENVER_DEFAULT_COORDS, 'anything', '80203', true)
  }, [updatePrices])

  // Handle Purist mode changes
  const handleModeChange = (newMode: PuristMode) => {
    setPuristMode(newMode)
    updatePrices(coords, newMode, currentZip, false)
  }

  // Handle Hub switches
  const handleHubSelect = (hubKey: string) => {
    const hub = METRO_HUBS[hubKey]
    if (hub) {
      setCurrentHub(hubKey)
      setCoords(hub.coords)
      setCurrentZip(hub.zip)
      updatePrices(hub.coords, puristMode, hub.zip, false)
    }
  }

  // Handle GPS coordinate lock
  const handleLockGps = async () => {
    setIsLocating(true)
    try {
      const userCoords = await getUserCoordinates()
      setCoords(userCoords)
      setCurrentHub('')
      setCurrentZip(undefined)
      await updatePrices(userCoords, puristMode, undefined, false)
    } catch (err) {
      console.warn('Geolocation failed or denied, using fallback hub')
    } finally {
      setIsLocating(false)
    }
  }

  // Handle Zip code submission
  const handleZipSubmit = (zip: string) => {
    setCurrentZip(zip)
    updatePrices(coords, puristMode, zip, false)
  }

  // Manual refresh button / hotkey
  const handleManualRefresh = () => {
    playCanOpenSound()
    updatePrices(coords, puristMode, currentZip, true)
  }

  // Share Spread to clipboard
  const handleShareSpread = async () => {
    if (!indexData) return
    playSuccessSound()
    const text = `🧊 THE DIET COKE INDEX\n📍 Sector: ${indexData.location_label}\n🔥 The Burn: ${indexData.burn.formatted_price} (${indexData.burn.size} @ ${indexData.burn.store_name})\n📦 The Stash: ${indexData.stash.formatted_price} (${indexData.stash.pack_desc} @ ${indexData.stash.store_name})\n📊 Unit Cost: $${indexData.stash.unit_cost_per_can.toFixed(2)}/can (${indexData.stash.vs_bodega_spread}% spread vs bodega)\nhttps://robertyoushock.com/fridgecig/`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // Fallback
    }
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if active in input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
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
  }, [coords, puristMode, currentZip])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Real-time Ticker Tape */}
      {indexData && <TickerTape data={indexData.ticker} />}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-10">
        {/* Header Header & Controls */}
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-dc-black text-white px-2.5 py-1 rounded text-[10px] uppercase tracking-[0.2em] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE ARBITRAGE DESK
            </span>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              title="Manually re-query live store shelf feeds without resetting location (Key: R)"
              aria-label="Refresh price feeds manually"
              className="inline-flex items-center gap-1.5 border px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-mono transition-all active:scale-[0.96] border-dc-black/20 hover:border-dc-crimson bg-white/60 hover:bg-white text-dc-black hover:text-dc-crimson cursor-pointer"
            >
              <svg
                className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>REFRESH PRICES [R]</span>
            </button>

            {/* Share Spread Button */}
            <button
              type="button"
              onClick={handleShareSpread}
              title="Copy financial arbitrage snapshot to clipboard"
              aria-label="Copy Diet Coke Index arbitrage data to clipboard"
              className="inline-flex items-center gap-1 border px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-mono transition-all active:scale-[0.96] border-dc-black/20 hover:border-dc-crimson bg-white/50 hover:bg-white text-dc-black hover:text-dc-crimson cursor-pointer"
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? 'SPREAD COPIED' : 'SHARE SPREAD'}</span>
            </button>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-dc-black tracking-tight mb-2">
            THE DIET COKE INDEX
          </h1>

          <p className="font-body text-xs sm:text-sm text-gray-500 tracking-[0.18em] sm:tracking-[0.2em] uppercase mb-1">
            Real-time retail arbitrage intelligence.
          </p>

          <p className="font-body text-[11px] text-gray-500 uppercase tracking-widest mb-6">
            <span>📍 REGIONAL BENCHMARK: {indexData?.location_label ?? 'DENVER METRO'}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="font-mono text-[10px] text-gray-400">UPDATED {updatedAt}</span>
          </p>

          {/* Purist Filter & Banned 2L Warning */}
          <PuristFilter
            mode={puristMode}
            onChange={handleModeChange}
            onOpenBannedModal={() => setIsBannedModalOpen(true)}
          />
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10 transition-all duration-150 opacity-100 scale-100">
          <BurnCard
            data={indexData?.burn ?? null}
            loading={loading}
            onOpenSchematic={() => setIsSchematicOpen(true)}
          />
          <StashCard
            data={indexData?.stash ?? null}
            loading={loading}
          />
        </div>

        {/* Coordinate Locking & Hub Selector */}
        <CoordinateLock
          onLockGps={handleLockGps}
          onSelectHub={handleHubSelect}
          onZipSubmit={handleZipSubmit}
          onOpenSchematic={() => setIsSchematicOpen(true)}
          isLocating={isLocating}
          currentHub={currentHub}
        />
      </main>

      {/* Colophon / Nutrition Facts Footer */}
      <Colophon />

      {/* Interactive Water Droplets Layer */}
      <CondensationDroplets />

      {/* McDonald's 34°F Closed-Loop Schematic Modal */}
      <GoldStandardSchematic
        isOpen={isSchematicOpen}
        onClose={() => setIsSchematicOpen(false)}
      />

      {/* Banned 2-Liter Modal */}
      <SeekHelpModal
        isOpen={isBannedModalOpen}
        onClose={() => setIsBannedModalOpen(false)}
      />
    </div>
  )
}
