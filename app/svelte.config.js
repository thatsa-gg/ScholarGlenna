import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: preprocess(),
    prerender: {
        enabled: false
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@use "src/lib/client/scss/variables.scss" as *;',
            },
        },
    },
    kit: {
        adapter: adapter(),

        files: {
            lib: "src/lib",
        },
    },
}

export default config
