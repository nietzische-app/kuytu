import type { Config } from "tailwindcss";

/**
 * Kuytu design system — "Midnight Luxe".
 *
 * A warm, mature dark theme for the 35–55 audience. The canvas is a deep
 * charcoal velvet (never harsh pure black); surfaces are softly elevated with
 * warm borders. A single champagne rose-gold carries highlights and CTAs, with
 * a garnet wine as the intimate secondary accent. Typography pairs Playfair
 * Display (editorial serif headers) with Plus Jakarta Sans (crisp body).
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- Surfaces ----
        "kuytu-bg": {
          DEFAULT: "#111015", // Deep charcoal velvet — primary canvas
          soft: "#16141D", // Slightly raised sections
          deep: "#0C0B10", // Deepest wells / gradients
        },
        "kuytu-card": {
          DEFAULT: "#1C1A24", // Cards, sheets, list surfaces
          raised: "#23202E", // Inputs, chips, elevated tiles
        },
        "kuytu-border": {
          DEFAULT: "#2D2A38", // Warm hairline borders
          soft: "#252231",
        },

        // ---- Accents ----
        "kuytu-gold": {
          DEFAULT: "#E5B880", // Champagne rose-gold — primary highlight
          soft: "#F0CFA0",
          deep: "#D4A373",
        },
        "kuytu-rose": {
          DEFAULT: "#A33246", // Garnet wine — secondary accent
          soft: "#C24A5E",
          deep: "#8C2535",
        },

        // ---- Text ----
        "kuytu-text": {
          DEFAULT: "#F5F3EF", // Warm off-white — primary text
          muted: "#9E9A93", // Soft taupe gray — secondary text
        },
        "kuytu-muted": "#9E9A93",

        // ---- Semantic actions ----
        "kuytu-pass": {
          DEFAULT: "#E57373", // Muted rose — Pass icon
          bg: "#2A1D22", // Soft charcoal-red button field
        },
        "kuytu-like": {
          DEFAULT: "#5BBF97", // Warm emerald — Like icon
          bg: "#1B2621",
        },
        "kuytu-super": {
          DEFAULT: "#8AB4E8", // Soft periwinkle — Super Like
          bg: "#1E2230",
        },

        // ---- Legacy aliases (mapped to the new palette) ----
        "kuytu-black": {
          DEFAULT: "#111015",
          soft: "#16141D",
          elevated: "#1C1A24",
        },
        "kuytu-burgundy": {
          DEFAULT: "#A33246",
          soft: "#C24A5E",
          deep: "#8C2535",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "1.75rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "grad-gold": "linear-gradient(135deg, #F0CFA0 0%, #D4A373 100%)",
        "grad-like": "linear-gradient(135deg, #E5B880 0%, #A33246 100%)",
        "grad-rose": "linear-gradient(135deg, #A33246 0%, #8C2535 100%)",
        "grad-match":
          "radial-gradient(120% 90% at 50% 0%, #3A1622 0%, #1C1A24 55%, #16141D 100%)",
        "grad-ambient":
          "radial-gradient(90% 60% at 50% -10%, rgba(163,50,70,0.28) 0%, rgba(17,16,21,0) 60%)",
      },
      boxShadow: {
        // Ambient card lift
        card: "0 28px 80px -24px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        surface: "0 10px 30px -12px rgba(0,0,0,0.6)",
        // Warm glows for active states / CTAs
        "glow-gold":
          "0 0 0 1px rgba(229,184,128,0.35), 0 10px 30px -8px rgba(229,184,128,0.35)",
        "glow-rose": "0 10px 34px -8px rgba(163,50,70,0.55)",
        "glow-like": "0 10px 30px -6px rgba(229,184,128,0.5)",
        action: "0 12px 30px -10px rgba(0, 0, 0, 0.75)",
        // Legacy alias
        gold: "0 0 0 1px rgba(229,184,128,0.35), 0 10px 30px -8px rgba(229,184,128,0.3)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(229,184,128,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(229,184,128,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-glow": "pulse-glow 2.4s ease-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
