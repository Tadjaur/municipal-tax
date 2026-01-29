import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Municipal blue theme based on mockup
        primary: {
          50: '#e6f1f5',
          100: '#cce3eb',
          200: '#99c7d7',
          300: '#66abc3',
          400: '#4a8fa8',
          500: '#3d7a94', // Main blue from mockup
          600: '#316480',
          700: '#254e6c',
          800: '#193858',
          900: '#0d2244',
        },
        teal: {
          50: '#e6f7f7',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#4dbfbf',
          500: '#33afaf', // Teal accent from mockup
          600: '#298c8c',
          700: '#1f6969',
          800: '#154646',
          900: '#0b2323',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#3d7a94',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#33afaf',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
};
