import { createClient } from 'redis'
import { REDIS_HOST, REDIS_PORT } from '../env.js'

type CreateClientFn = typeof createClient
type InitializeClientFn = (...args: Parameters<CreateClientFn>) => Promise<ReturnType<CreateClientFn>>
const initializeClient: InitializeClientFn = async (...args) => {
    const client = createClient(...args)
    await client.connect()
    return client
}
export const RedisClient: ReturnType<CreateClientFn> = await initializeClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
})
