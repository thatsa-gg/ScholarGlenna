import {
    Prisma,
    type Guild,
    type GuildMember,
    type User,
    type TeamPermission,
    AccessLevel,
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
                needs: { id: true, guildId: true },
                compute({ id: teamId, guildId }){
                    return async function check(permission: keyof Omit<TeamPermission, 'id' | 'teamId'>, user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>): Promise<boolean> {
                        const snowflake = typeof user === 'bigint' ? user : user.snowflake
                        const permissions = await client.teamPermission.findUniqueOrThrow({ where: { teamId }, select: { [permission]: true }})
                        const requiredLevel = permissions[permission] as unknown as AccessLevel
                        switch(requiredLevel){
                            case 'None':
                                return false
                            case 'GuildCaptain':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }, role: 'Captain' }}}, select: { id: true }})
                            case 'GuildRepresentative':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }, role: { in: [ 'Representative', 'Captain' ] }}}}, select: { id: true }})
                            case 'GuildManager':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }}}}, select: {id: true }})
                            case 'TeamCaptain':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { teamId, role: 'Captain' }}}, select: { id: true }})
                            case 'TeamRepresentative':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { teamId, role: { in: [ 'Representative', 'Captain' ] }}}}, select: { id: true }})
                            case 'TeamMember':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { teamId }}}, select: { id: true }})
                            case 'AnyGuild':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }}, select: { id: true }})
                            case 'AnyPublic':
                                return true
                        }
                    }
                }
            }
        },
        division: {
            isAuthorized: {
                needs: { id: true, guildId: true },
                compute({ id: divisionId, guildId }){
                    return async function check(permission: keyof Omit<DivisionPermission, 'id' | 'divisionId'>, user: bigint | Pick<GuildMember, 'snowflake'> | Pick<User, 'snowflake'>): Promise<boolean> {
                        const snowflake = typeof user === 'bigint' ? user : user.snowflake
                        const permissions = await client.divisionPermission.findUniqueOrThrow({ where: { divisionId }, select: { [permission]: true }})
                        const requiredLevel = permissions[permission] as unknown as AccessLevel
                        switch(requiredLevel){
                            case 'None':
                                return false
                            case 'GuildCaptain':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }, role: 'Captain' }}}, select: { id: true }})
                            case 'GuildRepresentative':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }, role: { in: [ 'Representative', 'Captain' ] }}}}, select: { id: true }})
                            case 'GuildManager':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }}}}, select: {id: true }})
                            case 'TeamCaptain':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { role: 'Captain' }}}, select: { id: true }})
                            case 'TeamRepresentative':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { role: { in: [ 'Representative', 'Captain' ] }}}}, select: { id: true }})
                            case 'TeamMember':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: {} }}, select: { id: true }})
                            case 'AnyGuild':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }}, select: { id: true }})
                            case 'AnyPublic':
                                return true
                        }
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
                        const permissions = await client.guildPermission.findUniqueOrThrow({ where: { id: guildId }, select: { [permission]: true }})
                        const requiredLevel = permissions[permission] as unknown as AccessLevel
                        switch(requiredLevel){
                            case 'None':
                                return false
                            case 'GuildCaptain':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }, role: 'Captain' }}}, select: { id: true }})
                            case 'GuildRepresentative':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }, role: { in: [ 'Representative', 'Captain' ] }}}}, select: { id: true }})
                            case 'GuildManager':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { team: { type: 'Management' }}}}, select: {id: true }})
                            case 'TeamCaptain':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { role: 'Captain' }}}, select: { id: true }})
                            case 'TeamRepresentative':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: { role: { in: [ 'Representative', 'Captain' ] }}}}, select: { id: true }})
                            case 'TeamMember':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }, teamMemberships: { some: {} }}, select: { id: true }})
                            case 'AnyGuild':
                                return null !== await client.guildMember.findUnique({ where: { snowflake_guildId: { snowflake, guildId }}, select: { id: true }})
                            case 'AnyPublic':
                                return true
                        }
                    }
                }
            }
        }
    }
}))
