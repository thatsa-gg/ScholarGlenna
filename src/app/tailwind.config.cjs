const defaultTheme = require('tailwindcss/defaultTheme')

const breaks = Object.entries({
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
})

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,svelte,js,ts}'],
    theme: {
        screens: Object.fromEntries(breaks.map(([k, max]) => [ k, { max } ])),
        extend: {
            width: Object.fromEntries(breaks),
            transitionProperty: {
                width: 'width'
            }
        },
    },
    plugins: [],
}
