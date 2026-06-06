import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        signal: {
          ink: "#171717",
          paper: "#fafafa",
          mint: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      spacing: {
        28: "7rem",
      },
      fontSize: {
        "5xl": "2.5rem",
        "6xl": "2.75rem",
        "7xl": "4.5rem",
        "8xl": "6.25rem",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.06)",
        md: "0 4px 12px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
