import { createClient } from 'redis'

const {
    REDIS_HOST: _REDIS_HOST,
    REDIS_PORT: _REDIS_PORT,
    REDIS_PASSWORD: _REDIS_PASSWORD,
} = process.env
if(!_REDIS_HOST) throw `[env] Missing: REDIS_HOST`
if(!_REDIS_PORT) throw `[env] Missing: REDIS_PORT`
if(!_REDIS_PASSWORD) throw `[env] Missing: REDIS_PASSWORD`

const redisPort = Number.parseInt(_REDIS_PORT)
export const REDIS_HOST: string = _REDIS_HOST
export const REDIS_PORT: number = redisPort
export const REDIS_PASSWORD: string = _REDIS_PASSWORD

export const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    password: REDIS_PASSWORD,
})
