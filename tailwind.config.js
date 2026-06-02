/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF8F0',
          100: '#FFE8C7',
          200: '#FFD199',
          300: '#FFB366',
          400: '#FF9533',
          500: '#E8750A',  // orange sénégalais — couleur principale
          600: '#C45F00',
          700: '#9A4A00',
          800: '#703600',
          900: '#462100',
        },
        accent: {
          50:  '#F0F9F4',
          100: '#D0EDDA',
          200: '#A2DAB8',
          300: '#6CC48F',
          400: '#3AAD68',
          500: '#1E8F4E',  // vert — confiance / confirmation
          600: '#166E3C',
          700: '#0F4E2B',
          800: '#0A3320',
          900: '#051A10',
        },
        sand: {
          50:  '#FDFBF7',
          100: '#F7F0E4',
          200: '#EDE0C8',
          300: '#DFC8A0',
          400: '#C9A96E',
          500: '#B08840',  // sable / terre
          600: '#8A6830',
          700: '#644A22',
          800: '#3E2D14',
          900: '#1A1208',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 6px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
