/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        page: 'var(--c-page)',
        app: 'var(--c-bg)',
        'app-elev': 'var(--c-bg-elev)',
        'app-chip': 'var(--c-bg-chip)',
        'app-line': 'var(--c-line)',
        'app-line-soft': 'var(--c-line-soft)',
        'app-muted': 'var(--c-text-muted)',
        'app-faint': 'var(--c-text-faint)',
        accent: 'var(--c-accent)',
        now: 'var(--c-now)',
      },
      textColor: {
        app: 'var(--c-text)',
        muted: 'var(--c-text-muted)',
        faint: 'var(--c-text-faint)',
      },
      backgroundColor: {
        page: 'var(--c-page)',
        app: 'var(--c-bg)',
        'app-elev': 'var(--c-bg-elev)',
        'app-chip': 'var(--c-bg-chip)',
      },
      borderColor: {
        app: 'var(--c-line)',
        'app-soft': 'var(--c-line-soft)',
      },
      borderRadius: {
        chip: '10px',
        card: '14px',
      },
    },
  },
  plugins: [],
};
