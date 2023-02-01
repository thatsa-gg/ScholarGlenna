import { config } from 'dotenv'
import path from 'path/posix'
import { fileURLToPath } from 'url'
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../config.env") })

export function getConfig(){
    const {
        OAUTH_CLIENT_ID,
        OAUTH_CLIENT_SECRET,
    } = process.env
    if(!OAUTH_CLIENT_ID)
        throw `[env] Missing: OAUTH_CLIENT_ID`
    if(!OAUTH_CLIENT_SECRET)
        throw `[env] Missing: OAUTH_CLIENT_SECRET`
    return {
        OAUTH_CLIENT_ID,
        OAUTH_CLIENT_SECRET,
    }
}
