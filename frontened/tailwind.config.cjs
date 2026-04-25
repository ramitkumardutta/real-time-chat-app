
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    // Ensure DaisyUI generates CSS for these themes so
    // `data-theme="light"` and `data-theme="dark"` work.
    themes: [
      'light',
      'dark',
    ],
  },
};
