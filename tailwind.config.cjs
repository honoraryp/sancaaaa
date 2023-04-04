/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        gridTemplateRows: {
            "auto1" : "auto 1fr",
        },
        colors: {
          'white': '#ffffff',
          'black': '#000000',
          'nice-blue': '#2193b0',
          'nice-blue-light': '#6dd5ed',
          'purple': '#cc2b5e',
          'love': '#753a88',
          'mauve': '#42275a',
          'b-mauve': '#734b6d',
          'lush': '#56ab2f',
          'b-lush': '#a8e063',
          'soda': '#ffdd00',
          'b-soda': '#fbb034',
          'mars': '#ec9f05',
          'conquest': '#ff4e00',
          'luscious': '#009245',
          'lime': '#fcee21',
        },
    },
},
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
