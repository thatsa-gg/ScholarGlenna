const esbuild = require('esbuild')
const { readFileSync, writeFileSync, fstat } = require('fs')
const { generate } = require('gas-entry-generator')

void async function(){
    await esbuild.build({
        entryPoints: [ 'src/index.ts' ],
        outfile: 'dist/code.js',
        bundle: true,
        minify: true,
        keepNames: true,
        logLevel: 'info',
        platform: 'node',
        target: 'node16',
        plugins: [
            {
                name: 'gas',
                setup(build){
                    build.onEnd(result => {
                        const content = readFileSync(build.initialOptions.outfile, 'utf-8')
                        const gas = generate(content, { comment: true, autoGlobalExports: true })
                        writeFileSync(build.initialOptions.outfile, `var global=this;${gas.entryPointFunctions.replace(/\n/g, '')};(()=>{${content.trim()}})()`)
                    })
                }
            }
        ]
    })
}()
