import { config } from 'dotenv'
import path from 'path/posix'
import { fileURLToPath } from 'url'
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../config.env") })

export function getConfig(){
    const {
        REDIS_URI,
    } = process.env
    if(!REDIS_URI)
        throw `[env] Missing: REDIS_URI`
    return {
        REDIS_URI,
    }
}
