import Palettes from './colors/palettes.json'
import plugin from "tailwindcss/plugin"

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,svelte,js,ts}'],
    theme: {
        extend: {
            colors: Palettes.reduce((all, palette) => {
                all[palette.paletteName] = palette.swatches.reduce((palette, { name, color }) => {
                    palette[name] = `#${color}`
                    return palette
                }, {})
                return all
            }, {}),

            fontFamily: {
                primary: [
                    'Jost',
                    'sans-serif',
                ]
            },

            padding: {
                'sm': '0.125rem',
                'md': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },

            transitionProperty: {
                rounded: 'border-radius',
            },

            borderRadius: {
                half: '50%',
                third: '33%',
            },

            screens: {
                short: { raw: '(min-height: 480px)' }
            },
        },
    },
    plugins: [
        plugin(({ matchUtilities }) => {
            matchUtilities(
                { area: value => ({ gridArea: value }) },
                { values: {
                    header: 'header',
                    left: 'left',
                    right: 'right'
                }}
            )

            matchUtilities(
                { "scroll-w": value => ({ scrollbarWidth: value }) },
                { values: {
                    auto: "auto",
                    thin: "thin",
                    none: "none"
                }}
            )
        })
    ],
}

