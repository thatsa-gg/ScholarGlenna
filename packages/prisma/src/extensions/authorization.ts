import { Prisma } from '../../generated/client/index.js'

export type Authorization = {
    role?: Prisma.TeamMemberWhereInput['role'],
    team?: {
        alias?: Prisma.TeamWhereInput['alias'],
        type?: Prisma.TeamWhereInput['type'],
    }
} | { filter: Prisma.TeamMemberListRelationFilter }

export type TeamPermissions = Exclude<keyof Prisma.TeamPermissionSelect, keyof Prisma.TeamPermissionSelectScalar | 'members' | 'representatives' | 'captains' | 'team'>
export type DivisionPermissions = Exclude<keyof Prisma.DivisionPermissionSelect, keyof Prisma.DivisionPermissionSelectScalar | 'division'>
export type GuildPermissions = Exclude<keyof Prisma.GuildPermissionSelect, keyof Prisma.GuildPermissionSelectScalar | 'members' | 'teamMembers' | 'teamRepresentatives' | 'teamCaptains' | 'guild'>

type UserId = bigint | number | string | { snowflake: bigint | string } | { id: string | number } | null | undefined
function resolveUserId(id: UserId): bigint | number | null {
    if(id === null || id === undefined)
        return null
    switch(typeof id){
        case 'bigint': return id
        case 'string': return BigInt(id)
        case 'number': return id
        default:
            if('id' in id){
                if(typeof id.id === 'string')
                    return BigInt(id.id)
                return id.id
            }
            return BigInt(id.snowflake)
    }
}

function asLookup(id: NonNullable<UserId>): { id: number } | { snowflake: bigint } {
    switch(typeof id){
        case 'bigint': return { snowflake: id }
        case 'string': return { snowflake: BigInt(id) }
        case 'number': return { id }
        default:
            if('id' in id){
                if(typeof id.id === 'string')
                    return { snowflake: BigInt(id.id) }
                return { id: id.id }
            }
            return { snowflake: BigInt(id.snowflake) }
    }
}

export function permissionFragment(user: UserId): Prisma.RoleWhereInput {
    const id = resolveUserId(user)
    if(null === id)
        return { type: 'Public' }
    if(typeof id === 'bigint')
        return { permissions: { some: { user: { snowflake: id }}}}
    return { permissions: { some: { user: { id: id }}}}
}

export const authorizationExtension = Prisma.defineExtension(client => client.$extends({
    result: {
        team: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: teamId }){
                    return async function check(permission: TeamPermissions[], user: UserId): Promise<boolean> {
                        const fragment = permissionFragment(user)
                        return 0 < await client.teamPermission.count({
                            where: {
                                teamId,
                                AND: Object.assign({}, ...permission.map(p => ({ [p]: fragment })))
                            }
                        })
                    }
                }
            }
        },
        division: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: divisionId }){
                    return async function check(permission: DivisionPermissions[], user: UserId): Promise<boolean> {
                        const fragment = permissionFragment(user)
                        return 0 < await client.divisionPermission.count({
                            where: {
                                divisionId,
                                AND: Object.assign({}, ...permission.map(p => ({ [p]: fragment })))
                            }
                        })
                    }
                }
            }
        },
        guild: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: guildId }){
                    return async function check(permission: GuildPermissions[], user: UserId): Promise<boolean> {
                        const fragment = permissionFragment(user)
                        return 0 < await client.guildPermission.count({
                            where: {
                                guildId,
                                AND: Object.assign({}, ...permission.map(p => ({ [p]: fragment })))
                            }
                        })
                    }
                }
            }
        },
        profile: {
            isVisible: {
                needs: { id: true, visibility: true },
                compute({ id: profileId, visibility }){
                    return async function check(user: UserId): Promise<boolean> {
                        if(visibility === 'Public')
                            return true
                        if(user === null || user === undefined)
                            return false
                        if(visibility === 'SameGuild')
                            return 0 < await client.user.count({
                                where: {
                                    ...asLookup(user),
                                    guildMemberships: { some: { guild: { members: { some: { user: { profile: { id: profileId }}}}}}}
                                }
                            })
                        if(visibility === 'SameTeam')
                            return 0 < await client.user.count({
                                where: {
                                    ...asLookup(user),
                                    OR: [
                                        // on the same team
                                        { teamMemberRoles: { some: { teamMember: { team: { members: { some: { member: { user: { profile: { id: profileId }}}}}}}}}},
                                        {
                                            guildMemberships: {
                                                some: {
                                                    guild: {
                                                        // is a manager and in the same guild
                                                        permission: { managers: { members: { some: { user: asLookup(user) }}}},
                                                        members: { some: { user: { profile: { id: profileId }}}}
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            })
                        if(visibility === 'Private')
                            return 0 < await client.user.count({
                                where: {
                                    ...asLookup(user),
                                    OR: [
                                        // is self
                                        { profile: { id: profileId } },
                                        {
                                            guildMemberships: {
                                                some: {
                                                    guild: {
                                                        // is a manager and in the same guild
                                                        permission: { managers: { members: { some: { user: asLookup(user) }}}},
                                                        members: { some: { user: { profile: { id: profileId }}}}
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            })
                        return false
                    }
                }
            }
        }
    }
}))
