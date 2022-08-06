import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { dirname } from '@glenna/util'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [
        preprocess({
            scss: {
                prependData: `@use "${dirname(import.meta)}/src/scss/variables.scss" as *;`,
            },
        }),
    ],

    kit: {
        adapter: adapter(),

        files: {
            lib: "src/lib",
        },
    },
}

export default config
