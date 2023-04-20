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

type UserId = bigint | string | { snowflake: bigint | string } | { id: string }
function userId(id: UserId): bigint {
    switch(typeof id){
        case 'bigint': return id
        case 'string': return BigInt(id)
        default:
            if('id' in id)
                return BigInt(id.id)
            return BigInt(id.snowflake)
    }
}

export const authorizationExtension = Prisma.defineExtension(client => client.$extends({
    result: {
        team: {
            isAuthorized: {
                needs: { id: true },
                compute({ id: teamId }){
                    return async function check(permission: TeamPermissions[], user: UserId): Promise<boolean> {
                        const snowflake = userId(user)
                        return 0 < await client.teamPermission.count({
                            where: {
                                teamId,
                                AND: Object.assign({}, ...permission.map(p => ({
                                    [p]: { permissions: { some: { user: { snowflake }}}}
                                })))
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
                        const snowflake = userId(user)
                        return 0 < await client.divisionPermission.count({
                            where: {
                                divisionId,
                                AND: Object.assign({}, ...permission.map(p => ({
                                    [p]: { permissions: { some: { user: { snowflake }}}}
                                })))
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
                        const snowflake = userId(user)
                        return 0 < await client.guildPermission.count({
                            where: {
                                guildId,
                                AND: Object.assign({}, ...permission.map(p => ({
                                    [p]: { permissions: { some: { user: { snowflake }}}}
                                })))
                            }
                        })
                    }
                }
            }
        }
    }
}))
