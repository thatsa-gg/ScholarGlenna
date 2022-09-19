import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
