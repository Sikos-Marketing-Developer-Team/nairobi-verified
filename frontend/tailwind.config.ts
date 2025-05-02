import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // Adjust paths to match your project structure
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS files in src
    "./app/**/*.{js,ts,jsx,tsx}", // Include Next.js app directory
    "./components/**/*.{js,ts,jsx,tsx}", // Include components
    "./pages/**/*.{js,ts,jsx,tsx}", // Include pages (if using Pages Router)
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ef9607',
        'primary-dark': '#d88506',
        'background-light': '#ffffff',
        'background-dark': '#1a1a1a',
        'text-light': '#1a1a1a',
        'text-dark': '#ffffff',
      },
    },
  },
  plugins: [],
};

export default config; 