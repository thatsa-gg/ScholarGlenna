export { AppUrl } from "./url.js"
export { Auth } from "./auth.js"
export { Cache } from "./cache.js"
export { Database } from "./database/index.js"
export { Discord } from "./discord.js"
export { Http } from "./http.js"
export { Session } from "./session.js"
export { User } from "./user.js"

// Static Initialization
import { Cache } from "./cache.js"
import { Database } from "./database/raw.js"
export async function initialize(building: boolean){
    // Don't initialize if we're building the app
    if(building)
        return

    // We are in a live environment, perform initialization
    Cache.initialize()
    await Database.initialize()
}

export async function batch<T>(items: T[], size: number, fn: (items: T[]) => void | Promise<void>){
    let idx = 0
    do {
        const slice = items.slice(idx, idx + size)
        await fn(slice)
        idx += size
    } while(idx < items.length)
}
