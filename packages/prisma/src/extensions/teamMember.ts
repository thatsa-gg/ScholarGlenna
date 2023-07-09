import type { AutocompleteInteraction } from '@glenna/discord'
import { Prisma, type Team, type TeamMemberRole, type GuildMember } from '../../generated/client/index.js'
import type { TeamPermissions } from './authorization.js'

function displayName({ nickname, username }: { nickname: string | null, username: string }){
    return nickname ?? username
}

export const teamMemberExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        teamMember: {
            safeDelete(team: Pick<Team, 'id' | 'type'>, filter: Prisma.TeamMemberWhereInput = {}){
                // TODO: does this need to be looked at?
                if(team.type === 'Management')
                    return client.teamMember.deleteMany({
                        where: {
                            ...filter,
                            team: { id: team.id },
                            role: { not: 'Captain' } // can't delete the captain of the management team (the server owner)
                        }
                    })
                else
                    return client.teamMember.deleteMany({ where: { ...filter, team: { id: team.id }}})
            },
            add(team: Pick<Team, 'id'>, member: Pick<GuildMember, 'id'>, options?: { role?: TeamMemberRole }): Promise<{ id: number }>{
                return client.teamMember.upsert({
                    where: {
                        teamId_memberId: {
                            teamId: team.id,
                            memberId: member.id
                        }
                    },
                    update: {
                        role: options?.role,
                    },
                    create: {
                        role: options?.role ?? 'Member',
                        team: { connect: { id: team.id }},
                        member: { connect: { id: member.id }}
                    },
                    select: {
                        id: true
                    }
                })
            },
            async autocompleteSnowflake(interaction: AutocompleteInteraction, teamSnowflake: bigint | null, searchValue: string, permissions: TeamPermissions[]){
                if(!teamSnowflake)
                    return
                const snowflake = BigInt(interaction.user.id)
                const team = await client.team.findUnique({
                    where: {
                        snowflake: teamSnowflake,
                        guild: { snowflake: BigInt(interaction.guild!.id) },
                        permission: {
                            AND: Object.assign({}, ...permissions.map(p => ({
                                [p]: { permissions: { some: { user: { snowflake }}}}
                            }))),
                        }
                    },
                    select: {
                        members: {
                            where: {
                                member: {
                                    OR: [
                                        { name: { contains: searchValue, mode: 'insensitive' }},
                                        {
                                            user: {
                                                name: { contains: searchValue, mode: 'insensitive' }
                                            }
                                        }
                                    ]
                                }
                            },
                            take: 25,
                            select: {
                                snowflake: true,
                                computed: {
                                    select: {
                                        nickname: true,
                                        username: true
                                    }
                                }
                            }
                        }
                    }
                })
                if(!team)
                    return []
                return team.members.map(member => ({
                    name: displayName(member.computed),
                    value: member.snowflake.toString()
                }))
            }
        }
    },
    result: {
        teamMemberComputed: {
            displayName: {
                needs: { nickname: true, username: true },
                compute: displayName
            }
        }
    }
}))
