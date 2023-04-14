import {
    Prisma,
    type Guild,
    type GuildMember,
    type User,
    type TeamPermission,
    type DivisionPermission,
    type GuildPermission,
} from '../../generated/client/index.js'

export type Authorization = {
    role?: Prisma.TeamMemberWhereInput['role'],
    team?: {
        alias?: Prisma.TeamWhereInput['alias'],
        type?: Prisma.TeamWhereInput['type'],
    }
} | { filter: Prisma.TeamMemberListRelationFilter }

export const authorizationExtension = Prisma.defineExtension(client => client.$extends({
    client: {
        async isAuthorized(
            guild: bigint | Pick<Guild, 'snowflake'> | Pick<Guild, 'id'>,
            user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>,
            options: Authorization = { team: { type: 'Management' } }
        ){
            const teamMemberships = options && 'filter' in options ? options.filter : {
                some: {
                    role: options?.role,
                    OR: [
                        {
                            // if the member is in the right team type/on the team
                            team: {
                                alias: options?.team?.alias,
                                type: options?.team?.type
                            }
                        },
                        {
                            // or they are on a management team
                            team: {
                                type: 'Management'
                            }
                        }
                    ]
                }
            } satisfies Prisma.TeamMemberListRelationFilter
            const snowflake = typeof user === 'bigint' ? user : user.snowflake
            if(typeof guild === 'object' && 'id' in guild)
                return null !== await client.guildMember.findUnique({
                    where: {
                        snowflake_guildId: { snowflake, guildId: guild.id },
                        teamMemberships
                    },
                    select: { id: true }
                })
            const guildSnowflake = typeof guild === 'bigint' ? guild : guild.snowflake
            return null !== await client.guildMember.findFirst({
                where: {
                    snowflake, guild: { snowflake: guildSnowflake },
                    teamMemberships
                },
                select: { id: true }
            })
        }
    },
    result: {
        team: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: teamId }){
                    return async function check(permission: keyof Omit<TeamPermission, 'id' | 'teamId'>, user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>): Promise<boolean> {
                        const snowflake = typeof user === 'bigint' ? user : user.snowflake
                        return 0 < await client.teamPermission.count({ where: { teamId, [permission]: { permissions: { some: { user: { snowflake }}}}}})
                    }
                }
            }
        },
        division: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: divisionId }){
                    return async function check(permission: keyof Omit<DivisionPermission, 'id' | 'divisionId'>, user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>): Promise<boolean> {
                        const snowflake = typeof user === 'bigint' ? user : user.snowflake
                        return 0 < await client.divisionPermission.count({ where: { divisionId, [permission]: { permissions: { some: { user: { snowflake }}}}}})
                    }
                }
            }
        },
        guild: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: guildId }){
                    return async function check(permission: keyof Omit<GuildPermission, 'id' | 'guildId'>, user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>): Promise<boolean> {
                        const snowflake = typeof user === 'bigint' ? user : user.snowflake
                        return 0 < await client.guildPermission.count({ where: { guildId, [permission]: { permissions: { some: { user: { snowflake }}}}}})
                    }
                }
            }
        }
    }
}))
