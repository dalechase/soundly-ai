/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050a14',
        coal: '#07111f',
        panel: '#0d1b2e',
        line: '#17375c',
        neon: '#38bdf8',
        violet: '#2563eb',
        bluewash: '#0f2742',
        sky: '#7dd3fc',
        frost: '#dbeafe',
        amber: '#ffcc66',
        coral: '#ff6f91',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 36px rgba(56, 189, 248, 0.18)',
        violet: '0 0 36px rgba(37, 99, 235, 0.2)',
      },
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        16: '0.16',
        18: '0.18',
        22: '0.22',
        24: '0.24',
        32: '0.32',
        35: '0.35',
        42: '0.42',
        45: '0.45',
        48: '0.48',
        52: '0.52',
        54: '0.54',
        55: '0.55',
        58: '0.58',
        62: '0.62',
        64: '0.64',
        65: '0.65',
        66: '0.66',
        68: '0.68',
        72: '0.72',
        76: '0.76',
        78: '0.78',
        82: '0.82',
        84: '0.84',
      },
      backgroundImage: {
        'mesh-dark':
          'linear-gradient(135deg, #050a14 0%, #07111f 45%, #0a1a2d 100%)',
        'signal-grid':
          'linear-gradient(rgba(125,211,252,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.07) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
