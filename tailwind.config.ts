import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#02080F",
        surface: "#e2e8f0",
        ink: "#02080F",
        paper: "#FFFFFF",
        border: "#E2E8F0",
        accent: "#420000",
        neutral: "#000000",
      },
      fontSize: {
        h1: ["60px", { lineHeight: "1", fontWeight: "700" }],
        h2: ["48px", { lineHeight: "1", fontWeight: "700" }],
      },
      boxShadow: {
        hard: "8px 8px 0 #000000",
      },
      fontFamily: {
        heading: ["Oxanium", "sans-serif"],
        body: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "Roboto", "\"Helvetica Neue\"", "Arial", "\"Noto Sans\"", "sans-serif"],
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
