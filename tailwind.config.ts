import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        shell: "#07111f",
        grid: "#0f1f37",
        panel: "#09172b",
        cyan: "#47d7ff",
        azure: "#238cff",
        success: "#1ee1a8",
        warning: "#ffbf4d",
        danger: "#ff6178"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)"],
        body: ["var(--font-dm-sans)"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(71, 215, 255, 0.15), 0 0 24px rgba(35, 140, 255, 0.16)",
        "glow-strong": "0 0 0 1px rgba(71, 215, 255, 0.3), 0 0 42px rgba(71, 215, 255, 0.28)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(71,215,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(71,215,255,0.07) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
