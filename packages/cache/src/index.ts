import { getConfig } from './config.js'
import { serialize, deserialize } from 'node:v8'
import Redis from 'ioredis'

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */
const nodeFetch = fetch

type FetchOptions<T> = {
    init?: RequestInit
    expiry?: number
    namespace?: string
    parse: (data: Response) => T | Promise<T>
    hydrate: (object: unknown) => T | Promise<T>
}

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

    export async function fetch<T>(client: Redis, url: URL, options: FetchOptions<T>): Promise<T> {
        const key = `fetch_cached:${options.namespace}:${Buffer.from(url.toString()).toString('base64')}`
        const cached = await client.getBuffer(key)
        if(null === cached){
            const response = await nodeFetch(url, options.init)
            const data = await options.parse(response)
            await client.set(key, serialize(data), "EX", options.expiry ?? ONE_DAY)
            return data
        }
        return await options.hydrate(deserialize(cached))
    }
}
