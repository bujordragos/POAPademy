/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#C5BAFF",
          "primary-content": "#151926",
          secondary: "#C5BAFF",
          "secondary-content": "#151926",
          accent: "#151926",
          "accent-content": "#151926",
          neutral: "#151926",
          "neutral-content": "#C5BAFF",
          "base-100": "#FBFBFB",
          "base-200": "#E8F9FF",
          "base-300": "#C4D9FF",
          "base-content": "#151926",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",
          "--rounded-btn": "9999rem",
          ".tooltip": { "--tooltip-tail": "6px" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
      {
        dark: {
          primary: "#1F7D53",
          "primary-content": "#FFFFFF",
          secondary: "#1F7D53",
          "secondary-content": "#FFFFFF",
          accent: "#FFFFFF",
          "accent-content": "#FFFFFF",
          neutral: "#FFFFFF",
          "neutral-content": "#FFFFFF",
          "base-100": "#212B25",
          "base-200": "#303D38",
          "base-300": "#255F38",
          "base-content": "#FFFFFF",
          info: "#3B82F6",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          "--rounded-btn": "9999rem",
          ".tooltip": { "--tooltip-tail": "6px" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: { center: "0 0 12px -2px rgb(0 0 0 / 0.05)" },
      animation: { "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
    },
  },
};
