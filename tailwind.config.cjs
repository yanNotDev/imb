/** @type {import('tailwindcss').Config} */
// import 'tailwindcss-bg-patterns';

const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hanken: ["Hanken Grotesk", "Inter"],
        general: ["General Sans", "Inter"],
        azeret: ["Azeret Mono", "Inter"],
        clash: ["Clash Grotesk", "Inter"],
        satoshi: ["Satoshi", "Inter"],
      },
      colors: {
        gpt: "#f97316",
        gptLight: "#ff842e",
        gptLighter: "#ff944a",
        gptLightest: "#ffb17b",
        gptDark: "#e1650e",
        gptDarker: "#c5570a",
        imb: {
          yellow: '#f7d861',
          'yellow-light': '#f8e08a',
          'yellow-dark': '#e6c84f',
          blue: '#f6d760',
          'blue-light': '#f7e48a',
          'blue-dark': '#e4c54f',
        },
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 200ms ease-in-out",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  plugins: [require("tailwindcss-bg-patterns")],
};

module.exports = config;
