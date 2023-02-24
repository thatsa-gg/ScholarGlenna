import { sveltekit } from '@sveltejs/kit/vite'
export default {
    plugins: [sveltekit()],
    ssr: {
        external: [
            '@glenna/*'
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
