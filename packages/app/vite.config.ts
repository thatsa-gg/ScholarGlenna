import { sveltekit } from '@sveltejs/kit/vite'
export default {
    plugins: [sveltekit()],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@use "src/scss/variables.scss" as *;',
            },
        },
    },
    ssr: {
        external: [
            '@glenna/common',
            '@glenna/util'
        ],
        noExternal: [
            '@fortawesome/*'
        ]
    }
}
