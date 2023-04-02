import { DiscordCDN } from '@glenna/discord'
import { Prisma } from '../../generated/client/index.js'

export const userExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        user: {
            prune(){
                return client.user.deleteMany({
                    where: {
                        guildMemberships: { none: {}},
                        profile: null
                    }
                })
            }
        }
    },
    result: {
        user: {
            displayName: {
                needs: { name: true, discriminator: true },
                compute({ name, discriminator }){ return `${name}#${discriminator}` }
            },

            avatar: {
                needs: { snowflake: true, icon: true, discriminator: true },
                compute({ snowflake, icon, discriminator }){
                    if(icon)
                        return DiscordCDN.avatar(snowflake.toString(), icon)
                    return DiscordCDN.defaultAvatar(Number.parseInt(discriminator))
                }
            }
        }
    }
}))
