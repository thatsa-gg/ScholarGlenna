import { sveltekit } from '@sveltejs/kit/vite'
export default {
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
        }
    }
}
