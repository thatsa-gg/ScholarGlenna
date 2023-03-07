import { Prisma, type Team, type TeamMemberRole, type GuildMember } from '../../generated/client/index.js'
import type { Role } from '@glenna/discord'

export const teamMemberExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        teamMember: {
            deleteWhereRole(team: Pick<Team, 'id' | 'type'>, role: bigint | Role){
                const source = typeof role === 'bigint' ? role : BigInt(role.id)
                if(team.type === 'Management')
                    return client.teamMember.deleteMany({
                        where: {
                            team: { id: team.id },
                            source,
                            role: { not: 'Captain' } // can't delete the captain of the management team (the server owner)
                        }
                    })
                else
                    return client.teamMember.deleteMany({
                        where: {
                            team: { id: team.id },
                            source
                        }
                    })
            },
            add(team: Pick<Team, 'id'>, member: Pick<GuildMember, 'id'>, options?: { role?: TeamMemberRole, source?: Role }){
                const source = options?.source ? BigInt(options.source.id) : undefined
                return client.teamMember.upsert({
                    where: {
                        teamId_memberId: {
                            teamId: team.id,
                            memberId: member.id
                        }
                    },
                    update: {
                        role: options?.role,
                        source,
                    },
                    create: {
                        role: options?.role ?? 'Member',
                        source,
                        team: { connect: { id: team.id }},
                        member: { connect: { id: member.id }}
                    }
                })
            }
        }
    }
}))
