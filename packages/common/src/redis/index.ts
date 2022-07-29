import { createClient } from 'redis'
import { REDIS_HOST, REDIS_PORT } from '../env.js'

type CreateClientFn = typeof createClient
type RedisClient = ReturnType<CreateClientFn>
type InitializeClientFn = (...args: Parameters<CreateClientFn>) => Promise<RedisClient>
const initializeClient: InitializeClientFn = async (...args) => {
    const client = createClient(...args)
    await client.connect()
    return client
}
let clientInstance: RedisClient | null = null
export async function getRedisClient(): Promise<RedisClient> {
    if(!clientInstance){
        console.debug(`Instantiating Redis client instance.`)
        return clientInstance = await initializeClient({
            url: `redis://${REDIS_HOST}:${REDIS_PORT}`
        })
    }
    return clientInstance
}
