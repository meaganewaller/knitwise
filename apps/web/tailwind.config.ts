import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f7f4ee',
        paper: {
          DEFAULT: '#fdfbf7',
          dark: '#f0ebe0',
        },
        ink: {
          DEFAULT: '#1e1a16',
          soft: '#6b5e54',
          muted: '#9e8e84',
        },
        frame: '#e8e0d4',
        green: {
          DEFAULT: '#2d4a3e',
          mid: '#4a7a68',
          light: '#c8ddd8',
        },
        terra: {
          DEFAULT: '#c4603a',
          light: '#f0d0c4',
        },
        gold: {
          DEFAULT: '#c4963a',
          light: '#f0e0c0',
        },
        hi: {
          bg: '#fffbe6',
          border: '#f0d040',
          text: '#7a6000',
        },
        adj: {
          bg: '#eaf4ff',
          border: '#5599dd',
          text: '#1a4a7a',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          fg: 'var(--accent-fg)',
          light: 'var(--accent-light)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      boxShadow: {
        editorial: '0 2px 12px rgba(30,26,22,.06)',
        'editorial-lg': '0 8px 32px rgba(30,26,22,.13)',
      },
    },
  },
  plugins: [],
}

export default config
