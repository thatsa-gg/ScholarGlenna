import { Prisma, type Team, type TeamMemberRole, type GuildMember } from '../../generated/client/index.js'

function displayName({ nickname, username, discriminator }: { nickname: string | null, username: string, discriminator: string }){
    return nickname ?? `${username}#${discriminator}`
}

export const teamMemberExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        teamMember: {
            safeDelete(team: Pick<Team, 'id' | 'type'>, filter: Prisma.TeamMemberWhereInput = {}){
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
            add(team: Pick<Team, 'id'>, member: Pick<GuildMember, 'id'>, options?: { role?: TeamMemberRole }){
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
                    }
                })
            },
            async autocomplete(guildId: bigint, teamAlias: string | null, search: string, actor: bigint){
                if(!teamAlias)
                    return []
                const manager = await client.teamMember.findFirst({
                    where: {
                        team: {
                            type: 'Management',
                            guild: { snowflake: guildId }
                        },
                        member: {
                            guild: { snowflake: guildId },
                            snowflake: actor
                        },
                    },
                    select: { role: true }
                })
                const team = await client.team.findFirst({
                    where: {
                        guild: { snowflake: guildId },
                        alias: teamAlias,
                        members: manager ? undefined : {
                            some: { member: { snowflake: actor }}
                        }
                    },
                    select: {
                        members: {
                            where: {
                                OR: [
                                    { member: { name: { startsWith: search }}},
                                    { member: { user: { name: { startsWith: search }}}}
                                ]
                            },
                            take: 25,
                            select: {
                                id: true,
                                computed: {
                                    select: {
                                        nickname: true,
                                        username: true,
                                        discriminator: true
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
                    value: member.id
                }))
            }
        }
    },
    result: {
        teamMemberComputed: {
            displayName: {
                needs: { nickname: true, username: true, discriminator: true },
                compute: displayName
            }
        }
    }
}))
