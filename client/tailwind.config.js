/** @type {import('tailwindcss').Config} */
function token(name) {
  return `hsl(var(--${name}) / <alpha-value>)`;
}

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: token("background"),
        surface: {
          DEFAULT: token("surface"),
          2: token("surface-2"),
        },
        foreground: token("foreground"),
        muted: token("muted"),
        border: token("border"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        accent: token("accent"),
        success: token("success"),
        danger: token("danger"),
        ring: token("ring"),
      },
      borderColor: {
        DEFAULT: token("border"),
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
