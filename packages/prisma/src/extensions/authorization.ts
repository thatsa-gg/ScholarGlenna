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
        }
    }
}))
