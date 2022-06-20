import { createClient } from 'redis'

const {
    REDIS_HOST: _REDIS_HOST,
    REDIS_PORT: _REDIS_PORT,
} = process.env
if(!_REDIS_HOST) throw `[env] Missing: REDIS_HOST`
if(!_REDIS_PORT) throw `[env] Missing: REDIS_PORT`

const redisPort = Number.parseInt(_REDIS_PORT)
export const REDIS_HOST: string = _REDIS_HOST
export const REDIS_PORT: number = redisPort

export const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
})
await client.connect()
