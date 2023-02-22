import { Database, type DatabaseClient } from '@glenna/prisma'
import { Cache, type CacheClient } from '@glenna/cache'
import { getConfig } from './config'

export const database: DatabaseClient = Database.create()
export const cache: CacheClient = Cache.create()
export const REDIRECT_URI = `http://localhost:8080/api/login/callback`

const config = getConfig()
export const OAUTH_CLIENT_ID = config.OAUTH_CLIENT_ID
