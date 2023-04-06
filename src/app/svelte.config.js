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

        typescript: {
            config(config){
                delete config.compilerOptions.importsNotUsedAsValues
                delete config.compilerOptions.isolatedModules
                delete config.compilerOptions.preserveValueImports
                delete config.compilerOptions.ignoreDeprecations
                config.compilerOptions.verbatimModuleSyntax = true
                return config
            }
        }
    },
}

export default config
