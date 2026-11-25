import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Core (preserved — use dc-crimson for solid fills + white text, borders, focus rings)
        "dc-crimson": "#D91629",
        "dc-crimson-dark": "#B30F20",
        "dc-silver": "#E2E5E8",
        "dc-silver-light": "#F2F3F5",
        "dc-silver-dark": "#A8B0B8",
        "dc-black": "#181A1B",

        // Semantic Text & Surface Roles (WCAG AA >= 4.7:1 across silver, .glass-card #eff0f0, and white)
        "dc-crimson-text": "#9E0B1B",
        "dc-ink": "#181A1B",
        "dc-ink-secondary": "#374151",
        "dc-ink-muted": "#4B5563",
        "dc-positive": "#047857",
        "dc-positive-badge": "#065F46",
        "dc-info": "#1D4ED8",
        "dc-info-badge": "#1E40AF",
        "dc-gold-text": "#78350F",
        "dc-ticker-up": "#F87171",
        "dc-ticker-down": "#34D399",
        "dc-border-control": "#6B7280",
      },
      fontFamily: {
        display: ["var(--font-display)", "Anton", "Impact", "sans-serif"],
        body: ["var(--font-body)", "Inter", "-apple-system", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
