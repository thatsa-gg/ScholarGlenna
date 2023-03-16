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
        },
        teamTimeComputed: {
            timeCode: {
                needs: { epoch: true },
                compute({ epoch }){
                    return (style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'r' = 'f') => `<t:${epoch}:${style}>`
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
        },
        timeZone: {
            async autocomplete(searchValue: string){
                const matches = await client.timeZone.findMany({
                    where: {
                        OR: [
                            { name: { startsWith: searchValue, mode: 'insensitive' }},
                            { abbreviation: { startsWith: searchValue, mode: 'insensitive' }}
                        ]
                    },
                    select: {
                        name: true,
                        display: true
                    }
                })
                return matches.map(({ display, name }) => ({ name: display, value: name }))
            }
        }
    }
}))
