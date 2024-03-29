import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
export default {
    compilerOptions: {
        runes: true,
    },
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        alias: {
            $components: './src/components'
        }
    }
}
