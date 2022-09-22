import { Temporal } from '@js-temporal/polyfill'
import type { User as DiscordUser } from 'discord.js'
import type { Prisma, Profile, User } from '../../generated/client'
import type { Transactionable } from './Client.js'
import type { Database } from '.'
import { getRedisClient } from '../redis'

type UpdateProfileInfo = null | Pick<Profile, 'profile_id'>
export class Profiles {
    #database: Database
    constructor(database: Database){ this.#database = database }
    async upsert(user: User, target: UpdateProfileInfo, options?: Transactionable): Promise<Profile> {
        const client = options?.client ?? this.#database.Client
        const data = {} as Prisma.ProfileCreateInput & Prisma.ProfileUpdateInput
        const update = { ...data }
        if(target && Object.keys(data).length > 0)
            update.updated_at = new Date()

        const { user_id } = user
        return await client.profile.upsert({ where: { user_id }, update, create: { user_id }})
    }
    async import(source: DiscordUser): Promise<Profile> {
        const redis = await getRedisClient()
        return await this.#database.Client.$transaction<Profile>(async client => {
            const snowflake = BigInt(source.id)
            const targetUser = await client.user.findUnique({ where: { snowflake }})
            const user = await this.#database.Users.upsert(source, targetUser, { client })
            const result = await client.profile.upsert({ where: { user_id: user.user_id }, update: {}, create: { user_id: user.user_id } })
            const lastConsistencyCheck = new Date()
            return result
        })
    }
}
