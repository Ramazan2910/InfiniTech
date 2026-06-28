/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1A2B4A', mid: '#243558' },
        blue: { DEFAULT: '#4FACDE', light: '#7DCBF0', xlight: '#E8F5FB' },
        surface: '#FFFFFF',
        bg: '#F7F9FC',
        border: '#E2E8F0',
        muted: '#64748B',
        text: '#1E293B',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        chip: '20px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(26,43,74,.06), 0 4px 16px rgba(26,43,74,.08)',
        'card-lg': '0 8px 32px rgba(26,43,74,.14)',
      },
    },
  },
  plugins: [],
};
