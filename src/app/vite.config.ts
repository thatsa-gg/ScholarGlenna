import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

export default defineConfig({
    plugins: [sveltekit()],
    ssr: {
        external: [
            '@glenna/auth',
            '@glenna/api',
            '@glenna/cache',
            '@glenna/discord',
            '@glenna/prisma',
            '@glenna/util',
        ],
        noExternal: [
            '@fortawesome/*'
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
