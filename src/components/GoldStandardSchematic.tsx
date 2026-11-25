'use client'

import { useEffect, useRef } from 'react'
import { CloseIcon } from '@/components/Icons'

interface GoldStandardSchematicProps {
  isOpen: boolean
  onClose: () => void
}

export default function GoldStandardSchematic({
  isOpen,
  onClose,
}: GoldStandardSchematicProps) {
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
      aria-labelledby="schematic-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md motion-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="glass-card bg-white/95 border border-amber-300/40 max-w-2xl w-full p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh] motion-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-amber-200 pb-3 mb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-amber-900 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
              ENGINEERING BLUEPRINT • SPEC 001
            </span>
            <h2 id="schematic-title" className="font-display text-2xl sm:text-3xl text-dc-black tracking-tight">
              MCDONALD&apos;S 34°F CLOSED-LOOP SCHEMATIC
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close schematic"
            className="text-dc-ink-muted hover:text-dc-ink min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-lg text-lg font-mono hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <CloseIcon size={20} className="w-5 h-5" />
          </button>
        </div>

        {/* Blueprint Content */}
        <p className="font-body text-sm text-dc-ink-secondary leading-relaxed mb-4">
          Why does fountain Diet Coke taste exponentially crisper at McDonald&apos;s than anywhere else on earth? It isn&apos;t placebo; it is rigorous chemical engineering and thermodynamic precision.
        </p>

        <div className="space-y-3 font-mono text-xs sm:text-sm">
          {/* Spec 1 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-800 font-bold">01 //</span>
              <h3 className="text-amber-950 font-bold uppercase tracking-wider text-xs sm:text-sm">
                STAINLESS STEEL SYRUP CELLS
              </h3>
            </div>
            <p className="text-dc-ink-secondary leading-snug">
              While ordinary soda fountains receive syrup in cardboard boxes with plastic bladder bags (BIB), McDonald&apos;s receives its syrup via insulated tanker trucks delivered into dedicated food-grade stainless steel tanks to preserve peak freshness and volatile flavor aromatics.
            </p>
          </div>

          {/* Spec 2 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-800 font-bold">02 //</span>
              <h3 className="text-amber-950 font-bold uppercase tracking-wider text-xs sm:text-sm">
                RECIRCULATING INSULATED &ldquo;PYTHONS&rdquo;
              </h3>
            </div>
            <p className="text-dc-ink-secondary leading-snug">
              Syrup and carbonated water lines run bundled inside an insulated chilled sheath with ice-water continuously circulating at 33°F–35°F from the walk-in cooler directly into the dispenser valve nozzle. The first drop dispensed is never lukewarm.
            </p>
          </div>

          {/* Spec 3 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-800 font-bold">03 //</span>
              <h3 className="text-amber-950 font-bold uppercase tracking-wider text-xs sm:text-sm">
                ICE-MELT COMPENSATED BRIX RATIO
              </h3>
            </div>
            <p className="text-dc-ink-secondary leading-snug">
              Carbon dioxide dissolves exponentially better at lower temperatures. The mixture is calibrated with a concentrated syrup-to-water ratio that accounts for melting ice dilution, guaranteeing peak effervescence down to the final sip.
            </p>
          </div>

          {/* Spec 4 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-800 font-bold">04 //</span>
              <h3 className="text-amber-950 font-bold uppercase tracking-wider text-xs sm:text-sm">
                WIDE-BORE EXTRUDED STRAW GEOMETRY
              </h3>
            </div>
            <p className="text-dc-ink-secondary leading-snug">
              The iconic red-and-yellow straw possesses a significantly wider internal diameter than standard fast-food straws, engineered specifically to disperse the micro-bubbles across the entirety of your taste buds simultaneously.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-amber-200 flex justify-between items-center gap-3 flex-wrap">
          <span className="text-[11px] font-mono text-dc-ink-muted uppercase tracking-widest">
            THE GOLD STANDARD OF ASPARTAME DELIVERY
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-5 py-2.5 bg-dc-black hover:bg-dc-crimson text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  )
}
