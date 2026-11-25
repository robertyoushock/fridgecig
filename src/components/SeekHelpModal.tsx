'use client'

import { useEffect, useRef } from 'react'
import { CloseIcon } from '@/components/Icons'

interface SeekHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SeekHelpModal({ isOpen, onClose }: SeekHelpModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const prevFocusedRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef<boolean>(false)

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      prevFocusedRef.current = document.activeElement as HTMLElement | null
    }
    if (!isOpen && wasOpenRef.current) {
      const toRestore = prevFocusedRef.current
      prevFocusedRef.current = null
      wasOpenRef.current = false
      requestAnimationFrame(() => toRestore?.focus?.())
      return
    }
    wasOpenRef.current = isOpen
    if (!isOpen) return

    const frame = requestAnimationFrame(() => closeBtnRef.current?.focus())

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="banned-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md motion-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="glass-card bg-white/95 border-2 border-dc-crimson/50 max-w-md w-full p-6 sm:p-7 rounded-2xl shadow-2xl relative motion-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-dc-crimson/20 pb-3 mb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-white bg-dc-crimson px-2.5 py-0.5 rounded-full inline-block font-bold mb-1">
              PROTOCOL VIOLATION
            </span>
            <h2 id="banned-title" className="font-display text-2xl text-dc-black tracking-tight">
              2-LITER BOTTLES ARE BANNED
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-dc-ink-muted hover:text-dc-ink min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-lg text-lg font-mono hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <CloseIcon size={20} className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 font-body text-sm text-dc-ink-secondary">
          <p>
            The Diet Coke Index strictly excludes 2-liter PET plastic bottles. Here is why:
          </p>
          <ul className="space-y-1.5 list-disc list-inside font-mono text-xs sm:text-sm text-dc-ink-secondary bg-red-50 p-3 rounded-lg border border-red-100">
            <li><strong>Gas Permeability:</strong> CO2 escapes through porous polyethylene terephthalate walls 40x faster than airtight aluminum.</li>
            <li><strong>Decarbonation Half-Life:</strong> A cracked 2-liter goes fatally flat within 24 minutes of uncapping.</li>
            <li><strong>Thermodynamic Insult:</strong> Plastic possesses low thermal conductivity; your soda stays lukewarm forever.</li>
          </ul>
          <p className="font-semibold text-dc-crimson-text text-pretty">
            Honor the silver can. Respect the 34°F closed-loop fountain.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-200 flex justify-between items-center gap-3 flex-wrap">
          <span className="text-[11px] font-mono text-dc-ink-muted uppercase tracking-widest">
            SEEK IMMEDIATE COLD CAN AID
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-5 py-2.5 bg-dc-crimson hover:bg-dc-crimson-dark text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            I REPENT
          </button>
        </div>
      </div>
    </div>
  )
}
