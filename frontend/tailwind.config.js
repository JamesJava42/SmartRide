/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f4ee",
        surface: "#fffdf8",
        ink: "#17211b",
        muted: "#67746c",
        accent: "#3a8f5b",
        accentDark: "#2f7449",
        line: "#dfddd6"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(23, 33, 27, 0.08)"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
