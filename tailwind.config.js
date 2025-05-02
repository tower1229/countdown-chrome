/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "chrome-blue": "#1a73e8",
        "chrome-green": "#1e8e3e",
        "chrome-red": "#d93025",
        "chrome-bg": "#ffffff",
        "chrome-text": "#202124",
        "chrome-secondary-text": "#5f6368",
        "chrome-border": "#dadce0",
        "chrome-hover-bg": "rgba(32, 33, 36, 0.04)",
        "chrome-active-bg": "rgba(32, 33, 36, 0.08)",
      },
    },
  },
  plugins: [],
};
