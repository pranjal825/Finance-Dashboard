/**
 * tailwind.config.js
 *
 * Extends Tailwind's default theme with custom tokens
 * used throughout the Finance Dashboard.
 *
 * NOTE: This file is loaded via a <script> tag in index.html
 * because we use the Tailwind Play CDN for development.
 * For a production build (Vite / CRA / Next.js), export
 * this object as module.exports instead.
 */

tailwind.config = {
  darkMode: 'class',          // toggled by adding/removing .dark on <html>
  theme: {
    extend: {
      /* ── Custom font families ────────────────── */
      fontFamily: {
        sans:    ['DM Sans', 'ui-sans-serif', 'system-ui'],
        display: ['DM Serif Display', 'ui-serif', 'Georgia'],
      },

      /* ── Design-token colors (map to CSS vars) ─ */
      colors: {
        accent:   'var(--accent)',
        accent2:  'var(--accent2)',
        blue:     'var(--blue)',
        red:      'var(--red)',
        amber:    'var(--amber)',
        purple:   'var(--purple)',

        bg: {
          DEFAULT: 'var(--bg)',
          2:       'var(--bg2)',
          3:       'var(--bg3)',
          4:       'var(--bg4)',
        },
        border: {
          DEFAULT: 'var(--border)',
          2:       'var(--border2)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2:       'var(--text2)',
          3:       'var(--text3)',
        },
      },

      /* ── Border radius tokens ────────────────── */
      borderRadius: {
        card: '18px',
        xl2:  '24px',
      },

      /* ── Box shadow ──────────────────────────── */
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.4)',
        modal: '0 8px 48px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
