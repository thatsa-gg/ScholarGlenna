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
    }
}))
