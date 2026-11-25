'use client'

export default function Colophon() {
  return (
    <div className="mt-8 md:mt-12">
      <footer className="w-full max-w-[340px] sm:max-w-sm mx-auto border-2 border-dc-black bg-white p-4 sm:p-5 font-body mb-10 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-sm">
        <h2 className="font-display text-2xl border-b-8 border-dc-black pb-1 mb-2">
          NUTRITION FACTS
        </h2>
        <div className="text-sm border-b border-gray-300 py-1">Serving Size 1 Web App</div>
        <div className="font-bold text-sm border-b-4 border-dc-black py-1">Calories 0</div>
        <div className="flex justify-between text-sm py-1 border-b-2 border-dc-black">
          <span>Built Over 1 Weekend</span>
          <span className="font-bold">100% Daily Value</span>
        </div>
        <div className="border-b border-gray-300 py-1.5 text-[11px] font-mono text-dc-ink-muted uppercase tracking-wider flex justify-between flex-wrap gap-1 select-none">
          <span className="font-semibold text-dc-ink-secondary">TERMINAL KEYS:</span>
          <span>[C] CAN · [F] FOUNTAIN · [A] ALL · [L] LOCK · [R] REFRESH</span>
        </div>
        <div className="pt-2 pb-3">
          <span className="font-bold text-xs">INGREDIENTS: </span>
          <span className="text-xs">
            GEOHASHED RETAIL ARBITRAGE, PUBLIC APIS, SPITE FOR $3.50 GAS STATION BOTTLES, TOO MUCH CAFFEINE, ZERO REGRETS
          </span>
        </div>
        <div className="border-t border-gray-300 pt-3 text-center flex flex-col items-center">
          <p className="text-xs text-dc-ink-muted uppercase tracking-wider mb-0.5">
            Designed &amp; Engineered By
          </p>
          <a
            href="https://robertyoushock.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-lg text-dc-crimson-text hover:underline min-h-[44px] px-3 py-2 inline-flex items-center justify-center"
          >
            ROB YOUSHOCK
          </a>
          <div className="mt-0.5">
            <a
              href="https://robertyoushock.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-dc-ink-muted hover:text-dc-crimson-text transition-colors tracking-wider min-h-[44px] px-3 inline-flex items-center justify-center"
            >
              [ → PORTFOLIO ]
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
