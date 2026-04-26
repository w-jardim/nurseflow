import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primario: '#0f766e',
        destaque: '#2563eb',
        tinta: '#10201d',
      },
    },
  },
  plugins: [],
} satisfies Config;
