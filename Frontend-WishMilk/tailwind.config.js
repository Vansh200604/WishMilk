// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,jsx}"],
//   theme: {
//     extend: {
//       colors: {
//         cream: {
//           DEFAULT: "#FBF6EC",
//           soft: "#F3ECDD",
//           card: "#FFFDF8",
//         },
//         ink: {
//           DEFAULT: "#22303B",
//           soft: "#4B5B67",
//           faint: "#8A98A2",
//         },
//         butter: {
//           DEFAULT: "#E7A73C",
//           light: "#F2C67A",
//           dark: "#C88A24",
//         },
//         dawn: {
//           DEFAULT: "#6E97B8",
//           light: "#AFC9DC",
//           dark: "#4C7392",
//         },
//         leaf: {
//           DEFAULT: "#4C8B62",
//           light: "#DCEBE1",
//         },
//         clay: {
//           DEFAULT: "#C1573A",
//           light: "#F5DED6",
//         },
//       },
//       fontFamily: {
//         display: ["'Fraunces'", "serif"],
//         body: ["'Inter'", "sans-serif"],
//         mono: ["'IBM Plex Mono'", "monospace"],
//       },
//       borderRadius: {
//         xl: "1rem",
//         "2xl": "1.5rem",
//         "3xl": "2rem",
//       },
//       boxShadow: {
//         soft: "0 8px 30px -12px rgba(34, 48, 59, 0.18)",
//         card: "0 2px 14px -4px rgba(34, 48, 59, 0.12)",
//       },
//       backgroundImage: {
//         "cream-top": "linear-gradient(90deg, #E7A73C 0%, #F2C67A 50%, #E7A73C 100%)",
//       },
//     },
//   },
//   plugins: [],
// };




/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Reactive tokens — driven by CSS variables in index.css, which
        // swap values when the .dark class is on <html>. Every existing
        // bg-cream / text-ink / etc. class in the app updates automatically;
        // no component code needs to change for dark mode to work.
        cream: {
          DEFAULT: "rgb(var(--wm-cream) / <alpha-value>)",
          soft: "rgb(var(--wm-cream-soft) / <alpha-value>)",
          card: "rgb(var(--wm-cream-card) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--wm-ink) / <alpha-value>)",
          soft: "rgb(var(--wm-ink-soft) / <alpha-value>)",
          faint: "rgb(var(--wm-ink-faint) / <alpha-value>)",
          // Fixed (non-reactive) navy — for text sitting on a butter-gold
          // accent (buttons, logo marks) that must stay dark in both themes.
          fixed: "#22303B",
        },
        butter: {
          DEFAULT: "rgb(var(--wm-butter) / <alpha-value>)",
          light: "rgb(var(--wm-butter-light) / <alpha-value>)",
          dark: "rgb(var(--wm-butter-dark) / <alpha-value>)",
        },
        dawn: {
          DEFAULT: "rgb(var(--wm-dawn) / <alpha-value>)",
          light: "rgb(var(--wm-dawn-light) / <alpha-value>)",
          dark: "rgb(var(--wm-dawn-dark) / <alpha-value>)",
        },
        leaf: {
          DEFAULT: "rgb(var(--wm-leaf) / <alpha-value>)",
          light: "rgb(var(--wm-leaf-light) / <alpha-value>)",
        },
        clay: {
          DEFAULT: "rgb(var(--wm-clay) / <alpha-value>)",
          light: "rgb(var(--wm-clay-light) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(34, 48, 59, 0.18)",
        card: "0 2px 14px -4px rgba(34, 48, 59, 0.12)",
      },
      backgroundImage: {
        "cream-top": "linear-gradient(90deg, #E7A73C 0%, #F2C67A 50%, #E7A73C 100%)",
      },
    },
  },
  plugins: [],
};