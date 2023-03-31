const { resolve } = require('path')

module.exports = {
    plugins: {
        "postcss-nesting": {},
        tailwindcss: { config: resolve(__dirname, './tailwind.config.cjs') },
        autoprefixer: {},
    },
}
