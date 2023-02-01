import { getConfig } from './config.js'
import Redis from 'ioredis'

export type CacheClient = ReturnType<typeof Cache.create>
export namespace Cache {
    export function create(){
        const config = getConfig()
        const client = new Redis(config.REDIS_URI, {
            lazyConnect: true
        })
        return {
            client
        }
    }
}
