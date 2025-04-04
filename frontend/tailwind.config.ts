import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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