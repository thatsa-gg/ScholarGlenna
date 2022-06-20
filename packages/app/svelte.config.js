import adapter from "@sveltejs/adapter-node";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [
        preprocess({
            scss: {
                prependData: '@use "src/scss/variables.scss" as *;',
            },
        }),
    ],

    kit: {
        adapter: adapter(),

        files: {
            lib: "src/lib",
        },

        vite: {
            css: {
                preprocessorOptions: {
                    scss: {
                        additionalData: '@use "src/scss/variables.scss" as *;',
                    },
                },
            },
            ssr: {
                external: [
                    '@glenna/common'
                ]
            }
        },
    },
};

export default config;
