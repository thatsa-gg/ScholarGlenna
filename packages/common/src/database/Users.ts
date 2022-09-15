import type { User as DiscordUser } from 'discord.js'
import type { Prisma, User } from '../../generated/client'
import type { Transactionable } from './Client.js'
import type { Database } from '.'

type UpdateUserInfo = null | Pick<User, 'user_id' | 'username' | 'discriminator' | 'avatar'>
export class Users {
    #database: Database
    constructor(database: Database){ this.#database = database }
    async upsert(source: DiscordUser, target: UpdateUserInfo, options?: Transactionable): Promise<User> {
        const db = options?.client ?? this.#database.Client
        const data = {} as Prisma.UserCreateInput & Prisma.UserUpdateInput
        if(target?.username !== source.username)
            data.username = source.username
        const discriminator = Number.parseInt(source.discriminator)
        if(target?.discriminator !== discriminator)
            data.discriminator = discriminator
        if(target?.avatar !== source.avatar)
            data.avatar = source.avatar
        const update = { ...data }
        if(target && Object.keys(data).length > 0)
            update.updated_at = new Date()
        const snowflake = BigInt(source.id)
        return await db.user.upsert({ where: { snowflake }, update, create: {
            snowflake,
            username: source.username,
            avatar: source.avatar,
            discriminator: Number.parseInt(source.discriminator)
        }})
    }

    async fetch(source: DiscordUser, options?: Transactionable & { correlationId?: bigint }): Promise<User> {
        const client = options?.client ?? this.#database.Client
        const snowflake = BigInt(source.id)
        // TODO: history UserCreate if new
        return await client.user.upsert({
            where: { snowflake },
            update: {},
            create: {
                snowflake,
                username: source.username,
                avatar: source.avatar,
                discriminator: Number.parseInt(source.discriminator)
            }
        })
    }

    async prune(options?: Transactionable){
        const db = options?.client ?? this.#database.Client
        await db.$executeRaw`
            delete from
                Users
            using
                UserReferenceCount
            where
                Users.user_id = UserReferenceCount.user_id
                and UserReferenceCount.Count = 0;
        `
    }
}
