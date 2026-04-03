import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        nav: '1100px',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1A3C6E',
        accent: '#F5B400',
        surface: '#FFFFFF',
        background: '#F8F9FB',
        'text-primary': '#0F172A',
        'text-muted': '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
        success: '#22C55E',
      },
    },
  },
  plugins: [],
} satisfies Config

