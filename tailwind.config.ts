import type { Config } from "tailwindcss";

/**
 * Kuytu design system.
 *
 * Dark-mode first. The palette is intentionally restrained and mature:
 * a near-black canvas, wine/burgundy for warmth and intimacy, and a single
 * amber/gold accent reserved for highlights (CTAs, badges, verified marks).
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
        // Core brand tokens
        "kuytu-black": {
          DEFAULT: "#0B0B0E", // Deep Night Black — primary canvas
          soft: "#121218", // Slightly raised surfaces
          elevated: "#1A1A22", // Cards, sheets, modals
        },
        "kuytu-burgundy": {
          DEFAULT: "#4A0E17", // Rich Burgundy / Wine
          soft: "#6B1622",
          deep: "#320910",
        },
        "kuytu-gold": {
          DEFAULT: "#D4AF37", // Warm Amber / Gold — highlight accent
          soft: "#E6C55C",
          deep: "#A8862A",
        },
        // Semantic action colors (large, obvious targets)
        "kuytu-pass": "#E5484D", // Red cross — Pass
        "kuytu-like": "#30A46C", // Green heart — Like
        "kuytu-super": "#4C9AFF", // Super Like
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "1.75rem",
      },
      boxShadow: {
        card: "0 20px 60px -15px rgba(0, 0, 0, 0.7)",
        gold: "0 0 0 1px rgba(212, 175, 55, 0.35), 0 8px 24px -8px rgba(212, 175, 55, 0.25)",
        action: "0 8px 20px -6px rgba(0, 0, 0, 0.6)",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
