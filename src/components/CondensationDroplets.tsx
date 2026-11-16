'use client'

import { useState } from 'react'
import { playWipeSound } from '@/lib/sound'

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

  const handleWipe = (id: number) => {
    playWipeSound()
    setDroplets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, wiped: true } : d))
    )
    // Recondense after 8 seconds
    setTimeout(() => {
      setDroplets((prev) =>
        prev.map((d) => (d.id === id ? { ...d, wiped: false } : d))
      )
    }, 8000)
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Droplet 1 */}
      {!droplets[0].wiped && (
        <button
          type="button"
          style={{ top: '14%', right: '5%' }}
          title="Wipe condensation droplet off the cold can"
          aria-label="Wipe condensation water droplet"
          onClick={() => handleWipe(1)}
          className="fixed pointer-events-auto cursor-pointer select-none transition-all duration-700 ease-in group -m-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rotate-6 opacity-90 hover:opacity-100 hover:scale-115 active:scale-90"
        >
          <svg
            width="34"
            height="44"
            viewBox="0 0 34 44"
            className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
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
      )}

      {/* Droplet 2 */}
      {!droplets[1].wiped && (
        <button
          type="button"
          style={{ top: '42%', left: '3%' }}
          title="Wipe condensation droplet off the cold can"
          aria-label="Wipe condensation water droplet"
          onClick={() => handleWipe(2)}
          className="fixed pointer-events-auto cursor-pointer select-none transition-all duration-700 ease-in group -m-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -rotate-12 opacity-90 hover:opacity-100 hover:scale-115 active:scale-90"
        >
          <svg
            width="28"
            height="38"
            viewBox="0 0 28 38"
            className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
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
      )}

      {/* Droplet 3 */}
      {!droplets[2].wiped && (
        <button
          type="button"
          style={{ bottom: '18%', right: '6%' }}
          title="Wipe condensation droplet off the cold can"
          aria-label="Wipe condensation water droplet"
          onClick={() => handleWipe(3)}
          className="fixed pointer-events-auto cursor-pointer select-none transition-all duration-700 ease-in group -m-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rotate-3 opacity-90 hover:opacity-100 hover:scale-115 active:scale-90"
        >
          <svg
            width="40"
            height="52"
            viewBox="0 0 40 52"
            className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
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
      )}

      {/* Droplet 4 */}
      {!droplets[3].wiped && (
        <button
          type="button"
          style={{ bottom: '24%', left: '4%' }}
          title="Wipe condensation droplet off the cold can"
          aria-label="Wipe condensation water droplet"
          onClick={() => handleWipe(4)}
          className="fixed pointer-events-auto cursor-pointer select-none transition-all duration-700 ease-in group -m-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -rotate-6 opacity-90 hover:opacity-100 hover:scale-115 active:scale-90"
        >
          <svg
            width="32"
            height="42"
            viewBox="0 0 32 42"
            className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
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
      )}

      {/* Sweating can badge */}
      <div className="fixed bottom-3 right-3 pointer-events-auto hidden md:flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider animate-pulse border border-white/20 select-none">
        <span>💧</span>
        <span>SWEATING CAN (CLICK DROPLETS TO WIPE)</span>
      </div>
    </div>
  )
}
