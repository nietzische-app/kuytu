import type { Config } from "tailwindcss";

/**
 * Kuytu design system — light, clean, and spacious.
 *
 * A bright off-white canvas with pure-white cards, soft shadows, thin light
 * borders, sharp charcoal headers, and a single warm champagne-gold accent
 * (active tabs, avatar rings, key badges). Typography is Plus Jakarta Sans
 * throughout — bold for headlines, crisp for body.
 */
const config: Config = {
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
          DEFAULT: "#FAFAFA", // Soft off-white canvas
          soft: "#F4F3F1", // Slightly warm sections
          deep: "#ECEBE8", // Wells / pressed states
        },
        "kuytu-card": {
          DEFAULT: "#FFFFFF", // Pure white cards / surfaces
          raised: "#F7F7F8", // Inputs, chips
        },
        "kuytu-border": {
          DEFAULT: "#E5E7EB", // Thin light borders / dividers
          soft: "#EFEFEF",
        },

        // ---- Text ----
        "kuytu-text": {
          DEFAULT: "#18181B", // Deep charcoal — headers & primary
          muted: "#71717A", // Neutral gray — secondary / timestamps
        },
        "kuytu-muted": "#71717A",

        // ---- Accent (champagne gold) ----
        "kuytu-accent": {
          DEFAULT: "#D4A373",
          soft: "#E5B880",
          deep: "#B8895A",
        },
        // Legacy alias — kuytu-gold stays the champagne accent.
        "kuytu-gold": {
          DEFAULT: "#D4A373",
          soft: "#E5B880",
          deep: "#B8895A",
        },

        // ---- Semantic actions ----
        "kuytu-pass": {
          DEFAULT: "#F0576F", // Rose-red — Pass
          bg: "#FDECEF",
        },
        "kuytu-like": {
          DEFAULT: "#22B07D", // Emerald — Like
          bg: "#E7F7F0",
        },
        "kuytu-super": {
          DEFAULT: "#3E90E0", // Blue — Super Like
          bg: "#E9F2FC",
        },

        // ---- Legacy aliases repointed to the light palette ----
        "kuytu-bg-deep": "#ECEBE8",
        "kuytu-black": {
          DEFAULT: "#FAFAFA",
          soft: "#F4F3F1",
          elevated: "#FFFFFF",
        },
        "kuytu-rose": {
          DEFAULT: "#D4A373",
          soft: "#E5B880",
          deep: "#B8895A",
        },
        "kuytu-burgundy": {
          DEFAULT: "#D4A373",
          soft: "#E5B880",
          deep: "#B8895A",
        },
      },
      fontFamily: {
        // Single clean sans throughout; `serif` kept as a legacy alias so
        // existing `font-serif` headers render in Jakarta too.
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "grad-gold": "linear-gradient(135deg, #E5B880 0%, #D4A373 100%)",
        "grad-like": "linear-gradient(135deg, #E5B880 0%, #D4A373 100%)",
        "grad-rose": "linear-gradient(135deg, #E5B880 0%, #D4A373 100%)",
        "grad-match":
          "radial-gradient(120% 90% at 50% 0%, #FFF6EC 0%, #FFFFFF 55%, #FAFAFA 100%)",
        // Soft gradient overlay for readable text on photos.
        "photo-scrim":
          "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 70%)",
      },
      boxShadow: {
        // Soft, elevated card lift on a light canvas.
        card: "0 1px 2px rgba(24,24,27,0.04), 0 10px 30px -12px rgba(24,24,27,0.16)",
        soft: "0 1px 2px rgba(24,24,27,0.04), 0 4px 16px -8px rgba(24,24,27,0.10)",
        surface: "0 1px 3px rgba(24,24,27,0.08)",
        nav: "0 -1px 0 rgba(24,24,27,0.06), 0 -8px 24px -16px rgba(24,24,27,0.12)",
        // Warm accent glow (subtle on light).
        "glow-gold": "0 8px 22px -8px rgba(212,163,115,0.55)",
        "glow-rose": "0 12px 30px -10px rgba(212,163,115,0.4)",
        "glow-like": "0 8px 22px -8px rgba(212,163,115,0.55)",
        action: "0 6px 18px -6px rgba(24,24,27,0.22)",
        gold: "0 8px 22px -8px rgba(212,163,115,0.55)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,163,115,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(212,163,115,0)" },
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
