import { debug } from '../util/logging.js'
import { database } from '../util/database.js'
import { listener } from '../EventListener.js'

export const guildMemberRemoveListener = listener('guildMemberRemove', {
    async execute(member){
        const user = await database.guildMember.findFirst({
            where: {
                user: { snowflake: BigInt(member.id) },
                guild: { snowflake: BigInt(member.guild.id) }
            },
            select: {
                id: true,
                name: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if(!user){
            debug(`Target user was not in database.`)
            return
        }
        await database.guildMember.update({
            where: { id: user.id },
            data: { lostRemoteReferenceAt: new Date() }
        })

        const name = user.name ?? user.user.name
        // TODO: notify that ${name} left the server.
    }
})
