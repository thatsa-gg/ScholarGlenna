// Settings
const defaultTheme = require('tailwindcss/defaultTheme')
const defaultColors = require('tailwindcss/colors')
const palettes = require('./colors/palettes.json')

const breaks = Object.entries({
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
})

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,svelte,js,ts}',
    ],
    theme: {
        //screens: Object.fromEntries(breaks.map(([k, max]) => [ k, { max } ])),
        extend: {
            //width: Object.fromEntries(breaks),
            transitionProperty: {
                width: 'width'
            },
            fontFamily: {
                primary: [ 'Noto Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif' ]
            },
            zIndex: {
                max: 1000,
                header: 200
            },
            padding: {
                'sm': '0.125rem',
                'md': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
        colors: Object.assign({}, defaultColors, ...palettes.map(palette => ({
            [palette.paletteName]: Object.fromEntries(palette.swatches.map(({ name, color }) => [ name, `#${color}` ]))
        }), {
            header: {
                DEFAULT: '#010409'
            }
        })),
        boxShadow: {
            'b-sm': '0 1px 0 rgb(2 2 2 / 0.2), 0 2px 0 rgb(5 5 5 / 0.05), 0 2px 0 rgb(2 2 2 / 0.05)',
            'b-md': '0 2px 0 rgb(2 2 2 / 0.2), 0 4px 0 rgb(5 5 5 / 0.05), 0 4px 0 rgb(2 2 2 / 0.05)',
            'sm': '1px 1px 0 rgb(2 2 2 / 0.2), 2px 2px 0 rgb(5 5 5 / 0.05), 2px 2px 0 rgb(2 2 2 / 0.05)',
            'md': '2px 2px 0 rgb(2 2 2 / 0.2), 4px 4px 0 rgb(5 5 5 / 0.05), 4px 4px 0 rgb(2 2 2 / 0.05)',
            'lg': '2px 2px 0 rgb(2 2 2 / 0.2), 8px 8px 0 rgb(5 5 5 / 0.05), 6px 6px 0 rgb(2 2 2 / 0.05)',
        }
    }
}

/*
    - sidebar: #1e1f22
    - navbar: #2b2d31
    - background: #313338
    - text:
        - title: #f2f3f5
        - subtitle: #bab5c1
        - channel: #949ba4
        - disabled: #4e5058
        - chat: #dbdee1
    - box-shadow --elevation-low: 0 1px 0 rgba(2,2,2,0.2), 0 1.5px 0 rgba(5,5,7,0.05),0 2px 0 rgba(2,2,2,0.05)
*/
