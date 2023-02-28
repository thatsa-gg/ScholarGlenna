import { Database, type DatabaseClient } from '@glenna/prisma'
import { Cache, type CacheClient } from '@glenna/cache'
import { getConfig } from './config'
import { building } from '$app/environment'

export const database: DatabaseClient = !building ? Database.create() : null!
export const cache: CacheClient = !building ? Cache.create() : null!
export const REDIRECT_URI = `http://localhost:8080/api/login/callback`

const config = getConfig()
export const OAUTH_CLIENT_ID = config.OAUTH_CLIENT_ID
