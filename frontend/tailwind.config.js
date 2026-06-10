/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          light: '#2D5F9E',
          50: '#EFF4FA',
          100: '#DCE7F4',
        },
        accent: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          50: '#FFF7ED',
        },
        success: {
          DEFAULT: '#16A34A',
          50: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          tint: '#FEF9C3',
        },
        danger: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F1F5F9',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        tx: {
          DEFAULT: '#0F172A',
          2: '#475569',
          3: '#64748B',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,0.04)',
        md: '0 4px 12px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        lg: '0 12px 32px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)',
      },
    },
  },
  plugins: [],
}
