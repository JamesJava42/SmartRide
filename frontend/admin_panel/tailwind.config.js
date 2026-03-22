/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f4f2",
        surface: "#ffffff",
        ink: "#1f2020",
        muted: "#676a67",
        accent: "#145f47",
        accentDark: "#0f4a37",
        line: "#dcdcda"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(31, 32, 32, 0.08)"
      }
    }
  },
  plugins: []
};
