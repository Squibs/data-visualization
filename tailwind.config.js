/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    screens: {
      xs: '320px',
      ...defaultTheme.screens,
    },
  },
  plugins: [],
};
