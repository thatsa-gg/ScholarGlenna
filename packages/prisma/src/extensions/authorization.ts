import {
    Prisma,
    type Guild,
    type GuildMember,
    type User,
    type TeamMemberRole
} from '../../generated/client/index.js'

export const authorizationExtension = Prisma.defineExtension(client => client.$extends({
    client: {
        async isAuthorized(
            guild: bigint | Pick<Guild, 'snowflake'> | Pick<Guild, 'id'>,
            user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>,
            role?: Prisma.TeamMemberWhereInput['role']
        ){
            const snowflake = typeof user === 'bigint' ? user : user.snowflake
            if(typeof guild === 'object' && 'id' in guild)
                return null !== await client.guildMember.findUnique({
                    where: {
                        snowflake_guildId: { snowflake, guildId: guild.id },
                        teamMemberships: { some: { role, team: { type: 'Management' }}}
                    },
                    select: { id: true }
                })
            const guildSnowflake = typeof guild === 'bigint' ? guild : guild.snowflake
            return null !== await client.guildMember.findFirst({
                where: {
                    snowflake, guild: { snowflake: guildSnowflake },
                    teamMemberships: { some: { role, team: { type: 'Management' }}}
                },
                select: { id: true }
            })
        }
    }
}))
