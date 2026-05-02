/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F6FF',
          100: '#D9E8FF',
          200: '#B7D2FF',
          300: '#8EB7FF',
          400: '#5FA8FF',
          500: '#3A7BFF',
          600: '#2F6BFF',
          700: '#2557D6',
          800: '#2149AD',
          900: '#1E3A8A'
        },
        surface: '#F5F7FA',
        ink: '#1E1E1E',
        muted: '#4F5B67',
        placeholder: '#C5CED8',
        success: '#4CD964',
        warning: '#FFC542',
        danger: '#FF4D4F'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      fontSize: {
        hero: ['clamp(2.35rem, 4vw, 4.75rem)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        section: ['clamp(1.75rem, 2.2vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        card: ['clamp(1.125rem, 1.25vw, 1.5rem)', { lineHeight: '1.3' }],
        body: ['clamp(1rem, 0.6vw, 1.05rem)', { lineHeight: '1.6' }],
        'body-sm': ['clamp(0.94rem, 0.5vw, 1rem)', { lineHeight: '1.7' }]
      },
      boxShadow: {
        soft: '0 16px 40px rgba(18, 52, 107, 0.08)',
        card: '0 10px 24px rgba(25, 50, 91, 0.08)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5FA8FF 0%, #2F6BFF 100%)'
      }
    }
  },
  plugins: []
}
