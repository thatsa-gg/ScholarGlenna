import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

export default defineConfig({
    plugins: [sveltekit()],
    ssr: {
        external: [
            '@glenna/cache',
            '@glenna/prisma',
            '@glenna/util',
        ],
        noExternal: [
            '@fortawesome/*',
            'svelte-octicons',
        ]
    },
    server: {
        watch: {
            usePolling: true
        },
        fs: {
            allow: [
                fileURLToPath(new URL('../../', import.meta.url)) // /workspace in the dev container
            ]
        }
    }
})
