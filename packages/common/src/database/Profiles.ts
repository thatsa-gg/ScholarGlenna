import { DiscordAPIError, User as DiscordUser, GuildMember as DiscordGuildMember, Collection } from 'discord.js'
import { RESTJSONErrorCodes } from 'discord-api-types/v10'
import type { Prisma, Profile, User } from '../../generated/client'
import type { Transactionable } from './Client.js'
import type { Database } from '.'
import { getRedisClient } from '../redis'
import { LAST_CONSISTENCY_CHECK } from './Guilds'

async function getLastConsistencyCheck(): Promise<Date | null> {
    const redis = await getRedisClient()
    const value = await redis.get(LAST_CONSISTENCY_CHECK)
    if(!value)
        return null
    return new Date(value)
}

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
        const lastConsistencyCheck = await getLastConsistencyCheck()
        return await this.#database.Client.$transaction<Profile>(async client => {
            const snowflake = BigInt(source.id)
            const targetUser = await client.user.findUnique({ where: { snowflake }})
            const user = await this.#database.Users.upsert(source, targetUser, { client })
            const result = await client.profile.upsert({ where: { user_id: user.user_id }, update: {}, create: { user_id: user.user_id } })
            if(!lastConsistencyCheck || result.lastConsistencyCheck.getTime() <= lastConsistencyCheck.getTime()){
                const members: DiscordGuildMember[] = []
                const guildIds: bigint[] = []
                for(const [, guild] of source.client.guilds.cache){
                    try {
                        members.push(await guild.members.fetch(source))
                        guildIds.push(BigInt(guild.id))
                    } catch(e) {
                        if(e instanceof DiscordAPIError && e.code === RESTJSONErrorCodes.UnknownMember)
                            continue
                        throw e
                    }
                }
                const guilds = await client.guild.findMany({
                    where: { snowflake: { in: guildIds }},
                    select: { guild_id: true, snowflake: true }
                })
                const guildMap = new Collection(guilds.map(guild => [ guild.snowflake.toString(), guild.guild_id ]))
                const discriminator = Number.parseInt(source.discriminator)
                const user_snowflake = BigInt(source.id)
                await client.importGuildMembers.createMany({
                    data: members
                        .filter(member => guildMap.has(member.guild.id))
                        .map(member => ({
                            discriminator,
                            guild_id: guildMap.get(member.guild.id)!,
                            username: source.username,
                            user_snowflake,
                            user_avatar: source.avatar,
                            nickname: member.nickname,
                            guild_avatar: member.avatar
                        }))
                })
                // TODO: execute new import method
            }
            return result
        })
    }
}
