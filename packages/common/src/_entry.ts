import { migrate } from './migrations/index.js'
if(process.argv.length > 2){
    const args = process.argv.slice(2)
    if(args[0] === 'migrate'){
        const reset = !!args.find(a => a === '--reset')
        const debug = !!args.find(a => a === '--debug')
        await migrate({ reset, debug })
    }
}
