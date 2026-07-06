import type { Config } from "tailwindcss";
import { colors, radii, fonts } from "./styles/tokens";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: colors.ink,
        paper: colors.paper,
        accent: colors.accent,
        signal: colors.signal,
        board: colors.board,
        state: colors.state,
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
        full: radii.full,
      },
      fontFamily: {
        display: [fonts.display, "serif"],
        body: [fonts.body, "sans-serif"],
        mono: [fonts.mono, "monospace"],
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(7, 9, 20, 0.65)",
        cta: "0 12px 30px -10px rgba(109, 93, 252, 0.55)",
      },
      maxWidth: {
        container: "1280px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(2%, -3%, 0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
