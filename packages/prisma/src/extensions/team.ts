import { Prisma, type Team, type TeamMemberRole, type GuildMember } from '../../generated/client/index.js'

export const teamExtension = Prisma.defineExtension((client) => client.$extends({
    result: {
        team: {
            mention: {
                needs: { name: true, role: true },
                compute({ name, role }){
                    if(role)
                        return `<@&${role}>`
                    return name
                }
            }
        }
    },
    model: {
        team: {
            async autocomplete(guildSnowflake: bigint, searchValue: string){
                const teams = await client.team.findMany({
                    where: {
                        guild: { snowflake: guildSnowflake },
                        OR: [
                            { name: { startsWith: searchValue }},
                            { alias: { startsWith: searchValue }}
                        ]
                    },
                    select: {
                        name: true,
                        alias: true
                    }
                })
                return teams.map(({ name, alias }) => ({ name, value: alias }))
            }
        }
    }
}))
