import { Database, type DatabaseClient, type Prisma } from '@glenna/prisma'
import { Cache, type CacheClient } from '@glenna/cache'
import { building } from '$app/environment'
import { env } from '$env/dynamic/private'
import type { UserSessionData } from './user'
import { CDN } from '@discordjs/rest'

export const database: DatabaseClient = !building ? Database.create() : null!
export const cache: CacheClient = !building ? Cache.create() : null!
export const ORIGIN: string = env.ORIGIN ?? `http://localhost:8080`
export const SSO_RETURN_URI = `${ORIGIN}/auth/sso/return`

export function profilePermission(user: Pick<UserSessionData['user'], 'id'>): Prisma.RoleWhereInput {
    return {
        permissions: {
            some: {
                user: {
                    id: user.id
                }
            }
        }
    }
}

export const DiscordCDN = new CDN()
