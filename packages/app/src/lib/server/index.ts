import { Database, type DatabaseClient } from '@glenna/prisma'
import { Cache, type CacheClient } from '@glenna/cache'

export const database: DatabaseClient = Database.create()
export const cache: CacheClient = Cache.create()
