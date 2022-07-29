import type { User as DiscordUser } from 'discord.js'
import type { Prisma, Profile, User } from '../../generated/client'
import type { Transactionable } from './Client.js'
import type { Database } from '.'

type UpdateProfileInfo = null | Pick<Profile, 'profile_id' | 'avatar'>
export class Profiles {
    #database: Database
    constructor(database: Database){ this.#database = database }
    async upsert(source: DiscordUser, user: User, target: UpdateProfileInfo, options?: Transactionable): Promise<Profile> {
        const client = options?.client ?? this.#database.Client
        const data = {} as Prisma.ProfileCreateInput & Prisma.ProfileUpdateInput
        if(target?.avatar !== source.avatar)
            data.avatar = source.avatar

        const update = { ...data }
        if(target && Object.keys(data).length > 0)
            update.updated_at = new Date()

        const { user_id } = user
        return await client.profile.upsert({ where: { user_id }, update, create: { user_id, avatar: data.avatar }})
    }
    async import(source: DiscordUser): Promise<Profile> {
        return await this.#database.Client.$transaction<Profile>(async client => {
            const snowflake = BigInt(source.id)
            const targetUser = await client.user.findUnique({ where: { snowflake }})
            const user = await this.#database.Users.upsert(source, targetUser, { client })
            const targetProfile = await client.profile.findUnique({ where: { user_id: user.user_id } })
            return await this.upsert(source, user, targetProfile, { client })
        })
    }
}
