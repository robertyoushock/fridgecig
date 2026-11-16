'use client'

import { useEffect } from 'react'

interface SeekHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SeekHelpModal({ isOpen, onClose }: SeekHelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="banned-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="glass-card bg-white/95 border-2 border-dc-crimson/50 max-w-md w-full p-6 sm:p-7 rounded-2xl shadow-2xl relative animate-[scale-up_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-dc-crimson/20 pb-3 mb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white bg-dc-crimson px-2.5 py-0.5 rounded-full inline-block font-bold mb-1">
              PROTOCOL VIOLATION
            </span>
            <h2 id="banned-title" className="font-display text-2xl text-dc-black tracking-tight">
              2-LITER BOTTLES ARE BANNED
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-dc-black p-1 rounded-lg text-lg font-mono hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 font-body text-xs sm:text-sm text-gray-700">
          <p>
            The Diet Coke Index strictly excludes 2-liter PET plastic bottles. Here is why:
          </p>
          <ul className="space-y-1.5 list-disc list-inside font-mono text-xs text-gray-600 bg-red-50 p-3 rounded-lg border border-red-100">
            <li><strong>Gas Permeability:</strong> CO2 escapes through porous polyethylene terephthalate walls 40x faster than airtight aluminum.</li>
            <li><strong>Decarbonation Half-Life:</strong> A cracked 2-liter goes fatally flat within 24 minutes of uncapping.</li>
            <li><strong>Thermodynamic Insult:</strong> Plastic possesses low thermal conductivity; your soda stays lukewarm forever.</li>
          </ul>
          <p className="font-semibold text-dc-crimson">
            Honor the silver can. Respect the 34°F closed-loop fountain.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            SEEK IMMEDIATE COLD CAN AID
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-dc-crimson hover:bg-dc-crimson-dark text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            I REPENT
          </button>
        </div>
      </div>
    </div>
  )
}
