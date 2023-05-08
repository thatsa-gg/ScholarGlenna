import { Database, type DatabaseClient } from '@glenna/prisma'
import { Cache, type CacheClient } from '@glenna/cache'
import { getConfig } from './config'
import { building } from '$app/environment'
import { env } from '$env/dynamic/private'

export const database: DatabaseClient = !building ? Database.create() : null!
export const cache: CacheClient = !building ? Cache.create() : null!
export const ORIGIN: string = env.ORIGIN ?? `http://localhost:8080`
export const SSO_RETURN_URI = `${ORIGIN}/auth/sso/return`

const config = getConfig()
export const OAUTH_CLIENT_ID = config.OAUTH_CLIENT_ID
