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
        "dc-crimson": "#D91629",
        "dc-crimson-dark": "#B30F20",
        "dc-silver": "#E2E5E8",
        "dc-silver-dark": "#A8B0B8",
        "dc-black": "#181A1B",
      },
      fontFamily: {
        display: ["Anton", "Impact", "sans-serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
