'use client'

import { useEffect } from 'react'

interface GoldStandardSchematicProps {
  isOpen: boolean
  onClose: () => void
}

export default function GoldStandardSchematic({
  isOpen,
  onClose,
}: GoldStandardSchematicProps) {
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
      aria-labelledby="schematic-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="glass-card bg-white/95 border border-amber-300/40 max-w-2xl w-full p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh] animate-[scale-up_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-amber-200 pb-3 mb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
              ENGINEERING BLUEPRINT • SPEC 001
            </span>
            <h2 id="schematic-title" className="font-display text-2xl sm:text-3xl text-dc-black tracking-tight">
              MCDONALD&apos;S 34°F CLOSED-LOOP SCHEMATIC
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schematic"
            className="text-gray-400 hover:text-dc-black p-1 rounded-lg text-lg font-mono hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Blueprint Content */}
        <p className="font-body text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
          Why does fountain Diet Coke taste exponentially crisper at McDonald&apos;s than anywhere else on earth? It isn&apos;t placebo; it is rigorous chemical engineering and thermodynamic precision.
        </p>

        <div className="space-y-3 font-mono text-xs">
          {/* Spec 1 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-600 font-bold">01 //</span>
              <strong className="text-amber-950 font-bold uppercase tracking-wider">
                STAINLESS STEEL SYRUP CELLS
              </strong>
            </div>
            <p className="text-gray-600 leading-snug">
              While ordinary soda fountains receive syrup in cardboard boxes with plastic bladder bags (BIB), McDonald&apos;s receives its syrup via insulated tanker trucks delivered into dedicated food-grade stainless steel tanks to preserve peak freshness and volatile flavor aromatics.
            </p>
          </div>

          {/* Spec 2 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-600 font-bold">02 //</span>
              <strong className="text-amber-950 font-bold uppercase tracking-wider">
                RECIRCULATING INSULATED &ldquo;PYTHONS&rdquo;
              </strong>
            </div>
            <p className="text-gray-600 leading-snug">
              Syrup and carbonated water lines run bundled inside an insulated chilled sheath with ice-water continuously circulating at 33°F–35°F from the walk-in cooler directly into the dispenser valve nozzle. The first drop dispensed is never lukewarm.
            </p>
          </div>

          {/* Spec 3 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-600 font-bold">03 //</span>
              <strong className="text-amber-950 font-bold uppercase tracking-wider">
                ICE-MELT COMPENSATED BRIX RATIO
              </strong>
            </div>
            <p className="text-gray-600 leading-snug">
              Carbon dioxide dissolves exponentially better at lower temperatures. The mixture is calibrated with a concentrated syrup-to-water ratio that accounts for melting ice dilution, guaranteeing peak effervescence down to the final sip.
            </p>
          </div>

          {/* Spec 4 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-600 font-bold">04 //</span>
              <strong className="text-amber-950 font-bold uppercase tracking-wider">
                WIDE-BORE EXTRUDED STRAW GEOMETRY
              </strong>
            </div>
            <p className="text-gray-600 leading-snug">
              The iconic red-and-yellow straw possesses a significantly wider internal diameter than standard fast-food straws, engineered specifically to disperse the micro-bubbles across the entirety of your taste buds simultaneously.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-amber-200 flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            THE GOLD STANDARD OF ASPARTAME DELIVERY
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-dc-black hover:bg-dc-crimson text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  )
}
