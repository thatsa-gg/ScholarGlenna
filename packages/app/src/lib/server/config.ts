import { config } from 'dotenv'
import path from 'path/posix'
import { fileURLToPath } from 'url'
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../config.env") })

export function getConfig(){
    const {
        OAUTH_CLIENT_ID,
    } = process.env
    if(!OAUTH_CLIENT_ID)
        throw `[env] Missing: OAUTH_CLIENT_ID`
    return {
        OAUTH_CLIENT_ID,
    }
}
