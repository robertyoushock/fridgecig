'use client'

import { useState, useRef, useEffect } from 'react'
import { playWipeSound } from '@/lib/sound'
import { DropletIcon, CheckIcon } from '@/components/Icons'

interface DropletState {
  id: number
  wiped: boolean
}

export default function CondensationDroplets() {
  const [droplets, setDroplets] = useState<DropletState[]>([
    { id: 1, wiped: false },
    { id: 2, wiped: false },
    { id: 3, wiped: false },
    { id: 4, wiped: false },
  ])
  const [wipeAnnouncement, setWipeAnnouncement] = useState('')
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const recondenseAllTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t))
      if (recondenseAllTimerRef.current) {
        clearTimeout(recondenseAllTimerRef.current)
      }
    }
  }, [])

  const announceWipe = (msg: string) => {
    setWipeAnnouncement('')
    requestAnimationFrame(() => setWipeAnnouncement(msg))
  }

  const wipedCount = droplets.filter((d) => d.wiped).length

  const handleWipe = (id: number) => {
    if (droplets.find((d) => d.id === id)?.wiped) return
    playWipeSound()
    const nextWipedCount = wipedCount + 1
    setDroplets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, wiped: true } : d))
    )
    if (nextWipedCount === 4) {
      announceWipe('All 4 droplets wiped. Recondensing in 8 seconds.')
    } else {
      announceWipe(`Wiped droplet ${nextWipedCount} of 4.`)
    }
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
    }
    timersRef.current[id] = setTimeout(() => {
      delete timersRef.current[id]
      setDroplets((prev) =>
        prev.map((d) => (d.id === id ? { ...d, wiped: false } : d))
      )
    }, 8000)
  }

  const handleWipeAllOrRecondense = () => {
    if (wipedCount === 4) {
      Object.keys(timersRef.current).forEach((key) => {
        const numKey = Number(key)
        clearTimeout(timersRef.current[numKey])
        delete timersRef.current[numKey]
      })
      if (recondenseAllTimerRef.current) {
        clearTimeout(recondenseAllTimerRef.current)
        recondenseAllTimerRef.current = null
      }
      setDroplets((prev) => prev.map((d) => ({ ...d, wiped: false })))
      announceWipe('Condensation restored. 0 of 4 droplets wiped.')
      return
    }

    playWipeSound()
    Object.keys(timersRef.current).forEach((key) => {
      const numKey = Number(key)
      clearTimeout(timersRef.current[numKey])
      delete timersRef.current[numKey]
    })
    if (recondenseAllTimerRef.current) {
      clearTimeout(recondenseAllTimerRef.current)
    }
    setDroplets((prev) => prev.map((d) => ({ ...d, wiped: true })))
    announceWipe('All 4 droplets wiped. Recondensing in 8 seconds.')
    recondenseAllTimerRef.current = setTimeout(() => {
      recondenseAllTimerRef.current = null
      setDroplets((prev) => prev.map((d) => ({ ...d, wiped: false })))
    }, 8000)
  }

  return (
    <>
      {/* Outer-margin floating droplets on wide desktop viewports only (>= 1280px) */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden hidden xl:block">
        {/* Droplet 1 */}
        <button
          type="button"
          aria-label="Wipe condensation water droplet 1 of 4"
          aria-hidden={droplets[0].wiped}
          tabIndex={droplets[0].wiped ? -1 : 0}
          onClick={() => handleWipe(1)}
          className={`fixed top-[14%] right-4 select-none group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            droplets[0].wiped ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
          }`}
        >
          <svg
            width="34"
            height="44"
            viewBox="0 0 34 44"
            aria-hidden="true"
            className={`rotate-6 transition-[transform,opacity] duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-active:scale-90 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
              droplets[0].wiped
                ? 'opacity-0 motion-safe:translate-y-10 motion-safe:scale-50'
                : 'opacity-90 group-hover:opacity-100'
            }`}
          >
            <defs>
              <radialGradient id="bodyGrad-1" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#d8e8f8" stopOpacity="0.65" />
                <stop offset="65%" stopColor="#8cb8dc" stopOpacity="0.45" />
                <stop offset="90%" stopColor="#5588b0" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2c4c66" stopOpacity="0.75" />
              </radialGradient>
              <radialGradient id="caustic-1" cx="65%" cy="75%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#c5e2ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="17"
              cy="22"
              rx="13"
              ry="18"
              fill="url(#bodyGrad-1)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="0.8"
            />
            <ellipse cx="20.25" cy="27.4" rx="7.15" ry="7.2" fill="url(#caustic-1)" />
            <ellipse cx="12.45" cy="15.7" rx="4.55" ry="5.04" fill="#ffffff" opacity="0.95" />
            <circle cx="15.05" cy="12.1" r="1.56" fill="#ffffff" opacity="0.85" />
          </svg>
        </button>

        {/* Droplet 2 */}
        <button
          type="button"
          aria-label="Wipe condensation water droplet 2 of 4"
          aria-hidden={droplets[1].wiped}
          tabIndex={droplets[1].wiped ? -1 : 0}
          onClick={() => handleWipe(2)}
          className={`fixed top-[42%] left-4 select-none group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            droplets[1].wiped ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
          }`}
        >
          <svg
            width="28"
            height="38"
            viewBox="0 0 28 38"
            aria-hidden="true"
            className={`-rotate-12 transition-[transform,opacity] duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-active:scale-90 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
              droplets[1].wiped
                ? 'opacity-0 motion-safe:translate-y-10 motion-safe:scale-50'
                : 'opacity-90 group-hover:opacity-100'
            }`}
          >
            <defs>
              <radialGradient id="bodyGrad-2" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#d8e8f8" stopOpacity="0.65" />
                <stop offset="65%" stopColor="#8cb8dc" stopOpacity="0.45" />
                <stop offset="90%" stopColor="#5588b0" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2c4c66" stopOpacity="0.75" />
              </radialGradient>
              <radialGradient id="caustic-2" cx="65%" cy="75%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#c5e2ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="14"
              cy="19"
              rx="11"
              ry="15"
              fill="url(#bodyGrad-2)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="0.8"
            />
            <ellipse cx="16.75" cy="23.5" rx="6.05" ry="6" fill="url(#caustic-2)" />
            <ellipse cx="10.15" cy="13.75" rx="3.85" ry="4.2" fill="#ffffff" opacity="0.95" />
            <circle cx="12.35" cy="10.75" r="1.32" fill="#ffffff" opacity="0.85" />
          </svg>
        </button>

        {/* Droplet 3 */}
        <button
          type="button"
          aria-label="Wipe condensation water droplet 3 of 4"
          aria-hidden={droplets[2].wiped}
          tabIndex={droplets[2].wiped ? -1 : 0}
          onClick={() => handleWipe(3)}
          className={`fixed bottom-[22%] right-4 select-none group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            droplets[2].wiped ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
          }`}
        >
          <svg
            width="40"
            height="52"
            viewBox="0 0 40 52"
            aria-hidden="true"
            className={`rotate-3 transition-[transform,opacity] duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-active:scale-90 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
              droplets[2].wiped
                ? 'opacity-0 motion-safe:translate-y-10 motion-safe:scale-50'
                : 'opacity-90 group-hover:opacity-100'
            }`}
          >
            <defs>
              <radialGradient id="bodyGrad-3" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#d8e8f8" stopOpacity="0.65" />
                <stop offset="65%" stopColor="#8cb8dc" stopOpacity="0.45" />
                <stop offset="90%" stopColor="#5588b0" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2c4c66" stopOpacity="0.75" />
              </radialGradient>
              <radialGradient id="caustic-3" cx="65%" cy="75%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#c5e2ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="20"
              cy="26"
              rx="16"
              ry="22"
              fill="url(#bodyGrad-3)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="0.8"
            />
            <ellipse cx="24" cy="32.6" rx="8.8" ry="8.8" fill="url(#caustic-3)" />
            <ellipse cx="14.4" cy="18.3" rx="5.6" ry="6.16" fill="#ffffff" opacity="0.95" />
            <circle cx="17.6" cy="13.9" r="1.92" fill="#ffffff" opacity="0.85" />
          </svg>
        </button>

        {/* Droplet 4 */}
        <button
          type="button"
          aria-label="Wipe condensation water droplet 4 of 4"
          aria-hidden={droplets[3].wiped}
          tabIndex={droplets[3].wiped ? -1 : 0}
          onClick={() => handleWipe(4)}
          className={`fixed bottom-[26%] left-4 select-none group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            droplets[3].wiped ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
          }`}
        >
          <svg
            width="32"
            height="42"
            viewBox="0 0 32 42"
            aria-hidden="true"
            className={`-rotate-6 transition-[transform,opacity] duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-active:scale-90 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
              droplets[3].wiped
                ? 'opacity-0 motion-safe:translate-y-10 motion-safe:scale-50'
                : 'opacity-90 group-hover:opacity-100'
            }`}
          >
            <defs>
              <radialGradient id="bodyGrad-4" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#d8e8f8" stopOpacity="0.65" />
                <stop offset="65%" stopColor="#8cb8dc" stopOpacity="0.45" />
                <stop offset="90%" stopColor="#5588b0" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2c4c66" stopOpacity="0.75" />
              </radialGradient>
              <radialGradient id="caustic-4" cx="65%" cy="75%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#c5e2ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="16"
              cy="21"
              rx="12"
              ry="17"
              fill="url(#bodyGrad-4)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="0.8"
            />
            <ellipse cx="19" cy="26.1" rx="6.6" ry="6.8" fill="url(#caustic-4)" />
            <ellipse cx="11.8" cy="15.05" rx="4.2" ry="4.76" fill="#ffffff" opacity="0.95" />
            <circle cx="14.2" cy="11.65" r="1.44" fill="#ffffff" opacity="0.85" />
          </svg>
        </button>
      </div>

      {/* In-flow Condensation Status & Wipe Dock (zero viewport overlap across 320px-1440px+) */}
      <section
        aria-label="Can condensation"
        className="max-w-6xl mx-auto w-full px-4 md:px-8 mt-4 mb-2 flex flex-col items-center"
      >
        <div className="bg-white/75 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-dc-ink">
            <DropletIcon className="w-3.5 h-3.5 text-sky-700" />
            <span>
              SWEATING CAN · {wipedCount === 4 ? 'ALL WIPED · RECONDENSING...' : `${wipedCount}/4 WIPED`}
            </span>
          </div>

          {/* Interactive inline droplet buttons for < 1280px viewports */}
          <div className="flex xl:hidden items-center gap-1.5" role="group" aria-label="Condensation droplets">
            {droplets.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleWipe(d.id)}
                disabled={d.wiped}
                aria-pressed={d.wiped}
                aria-label={d.wiped ? `Droplet ${d.id} wiped` : `Wipe condensation droplet ${d.id} of 4`}
                className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs font-mono font-semibold transition-all ${
                  d.wiped
                    ? 'bg-emerald-50 text-dc-positive-badge border border-emerald-500/30 opacity-60 cursor-default'
                    : 'bg-white hover:bg-dc-silver-light text-dc-ink border border-dc-border-control cursor-pointer motion-safe:active:scale-95'
                }`}
              >
                {d.wiped ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <DropletIcon className="w-4 h-4 text-sky-700" />
                )}
                <span className="sr-only">Droplet {d.id}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleWipeAllOrRecondense}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-dc-black hover:bg-dc-crimson text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer motion-safe:active:scale-95"
          >
            {wipedCount === 4 ? 'RECONDENSE NOW' : 'WIPE ALL'}
          </button>

          <span className="hidden xl:inline-block text-xs font-mono text-dc-ink-muted">
            Click side droplets or Wipe All
          </span>
        </div>

        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {wipeAnnouncement}
        </span>
      </section>
    </>
  )
}
