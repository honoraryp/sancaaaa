/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-teal-500',
    'bg-amber-300',
    'bg-orange-500',
    'bg-sky-300',
    'bg-lime-600',
    'bg-red-600',
    'bg-fuchsia-400',
    'text-blue-50',
    'text-amber-50',
    'text-rose-50',
    'text-indigo-50',
    'text-gray-950',
    'text-pink-50',
    'ring-blue-500',
    'ring-amber-500',
    'ring-rose-500',
    'ring-indigo-500',
    'ring-pink-500',
    'shadow-blue-200',
    'shadow-amber-200',
    'shadow-rose-200',
    'shadow-indigo-200',
    'shadow-pink-200'
  ],
  theme: {
    extend: {
        gridTemplateRows: {
            "auto1" : "auto 1fr",
        },
    },
},
  plugins: [],
}
