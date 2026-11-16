'use client'

import { PuristMode } from '@/types'
import { playTabSound } from '@/lib/sound'

interface PuristFilterProps {
  mode: PuristMode
  onChange: (mode: PuristMode) => void
  onOpenBannedModal?: () => void
}

export default function PuristFilter({
  mode,
  onChange,
  onOpenBannedModal,
}: PuristFilterProps) {
  const handleSelect = (newMode: PuristMode) => {
    playTabSound()
    onChange(newMode)
  }

  return (
    <div className="flex flex-col items-center">
      <div
        role="group"
        aria-label="Filter drink format"
        className="inline-flex items-center bg-white/50 backdrop-blur-md rounded-full p-1 border border-white/40 shadow-sm"
      >
        <button
          type="button"
          aria-pressed={mode === 'can'}
          aria-label="Filter to aluminum cans only"
          title="Filter to aluminum cans only"
          onClick={() => handleSelect('can')}
          className={`relative px-3.5 sm:px-5 py-2.5 sm:py-2 min-h-[44px] inline-flex items-center justify-center rounded-full font-body text-xs uppercase tracking-[0.15em] font-medium transition-all duration-200 ease-out select-none active:scale-[0.97] ${
            mode === 'can'
              ? 'bg-white text-dc-black shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          CAN
        </button>

        <button
          type="button"
          aria-pressed={mode === 'fountain'}
          aria-label="Filter to fountain soda only"
          title="Filter to fountain soda only"
          onClick={() => handleSelect('fountain')}
          className={`relative px-3.5 sm:px-5 py-2.5 sm:py-2 min-h-[44px] inline-flex items-center justify-center rounded-full font-body text-xs uppercase tracking-[0.15em] font-medium transition-all duration-200 ease-out select-none active:scale-[0.97] ${
            mode === 'fountain'
              ? 'bg-white text-dc-black shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          FOUNTAIN
        </button>

        <button
          type="button"
          aria-pressed={mode === 'anything'}
          aria-label="Show both cans and fountain options"
          title="Show both cans and fountain options"
          onClick={() => handleSelect('anything')}
          className={`relative px-3.5 sm:px-5 py-2.5 sm:py-2 min-h-[44px] inline-flex items-center justify-center rounded-full font-body text-xs uppercase tracking-[0.15em] font-medium transition-all duration-200 ease-out select-none active:scale-[0.97] ${
            mode === 'anything'
              ? 'bg-white text-dc-black shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          ANYTHING
        </button>
      </div>

      <button
        type="button"
        aria-label="View 2-Liter plastic bottle restriction notice"
        title="Restricted Format: Plastic 2-Liter Bottles"
        onClick={onOpenBannedModal}
        className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dc-black/5 hover:bg-dc-crimson/10 border border-dc-black/15 hover:border-dc-crimson/40 transition-all text-xs font-mono text-gray-500 hover:text-dc-crimson cursor-pointer group shadow-xs active:scale-[0.98]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-dc-crimson animate-pulse" />
        <span className="line-through decoration-dc-crimson decoration-2 font-medium tracking-wider">
          PLASTIC 2-LITER
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider bg-dc-crimson text-white px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
          BANNED
        </span>
      </button>
    </div>
  )
}
