import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0f1f3d', light: '#1e3a6e' },
        secondary: { DEFAULT: '#f97316' },
        success: '#2E9E5B',
        danger: '#D64545',
        warning: '#E8B339',
        neutral: {
          100: '#F4F5F7',
          300: '#D7DBE0',
          600: '#5B6472',
          900: '#1A1D23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '22px',
        '2xl': '28px',
        '3xl': '36px',
      },
    },
  },
  plugins: [],
} satisfies Config;
