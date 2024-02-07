import Redis from "ioredis"
import { REDIS_URI } from "./env.js"
import { serialize, deserialize } from "node:v8"

const nodeFetch = fetch
const ONE_DAY = 24 * 60 * 60 // one day/24 hours

let instance: Redis | null = null
export namespace Cache {
    export function initialize(){
        instance = new Redis(REDIS_URI, {
            lazyConnect: true
        })
    }

    export function get(){
        return instance!
    }

    export namespace Key {
        export function oauth2Request(id: string){ return `oauth2request:${id}` }
        export function sessionAccess(id: string){ return `session:access:${id}` }
        export function sessionData(id: string){ return `session:data:${id}` }
        export function cachedFetch(namespace: string | undefined, url: URL){
            return `fetchCached:${namespace}:${Buffer.from(url.toString()).toString("base64")}`
        }
    }

    export namespace Property {
        export namespace Session {
            export const Profile = "profile"
            export const User = "user"
            export const Refresh = "refresh"
        }
    }

    type FetchOptions<T> = {
        init?: RequestInit
        expiry?: number
        namespace?: string
        parse: (data: Response) => T | Promise<T>
        hydrate: (object: unknown) => T | Promise<T>
    }
    export async function fetch<T>(client: Redis, url: URL, options: FetchOptions<T>): Promise<T> {
        const key = Key.cachedFetch(options.namespace, url)
        const cached = await client.getBuffer(key)
        if(null !== cached)
            return await options.hydrate(deserialize(cached))

        const response = await nodeFetch(url, options.init)
        const data = await options.parse(response)
        await client.set(key, serialize(data), "EX", options.expiry ?? ONE_DAY)
        return data
    }
}
