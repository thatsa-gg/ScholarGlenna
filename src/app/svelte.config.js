import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { fileURLToPath } from 'url'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: preprocess({
        postcss: {
            configFilePath: fileURLToPath(new URL('./postcss.config.cjs', import.meta.url))
        }
    }),
    prerender: {
        enabled: false
    },
    kit: {
        adapter: adapter(),

        files: {
            lib: "src/lib",
        },
    },
}

export default config
