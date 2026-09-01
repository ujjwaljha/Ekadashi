/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        indigoink: {
          50: "#eef2ff",
          400: "#818cf8",
          600: "#4f46e5",
          800: "#1e1b4b",
          900: "#141136",
          950: "#0b0921",
        },
      },
    },
  },
  plugins: [],
};
