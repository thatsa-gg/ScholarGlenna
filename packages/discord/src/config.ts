import { config } from 'dotenv'
import path from 'path/posix'
import { fileURLToPath } from 'url'
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../config.env") })

export function getConfig(){
    const {
        DISCORD_TOKEN
    } = process.env
    if(!DISCORD_TOKEN)
        throw `[env] Missing: DISCORD_TOKEN`
    return {
        DISCORD_TOKEN
    }
}
