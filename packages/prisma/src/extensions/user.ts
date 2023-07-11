import { CDN } from '@discordjs/rest'
import { Prisma } from '../../generated/client/index.js'

const DiscordCDN = new CDN()
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
            avatar: {
                needs: { snowflake: true, icon: true },
                compute({ snowflake, icon }){
                    if(icon)
                        return DiscordCDN.avatar(snowflake.toString(), icon)
                    // from discord docs:
                    // old-style usernames with discriminators use the discriminator % 5 to determine the default avatar,
                    // and new-style usernames without use (user_id >> 22)%6.
                    // We're lazy, and eventually all will be new-style, so we're only going to calculate those.
                    return DiscordCDN.defaultAvatar(Number(snowflake >> 22n) % 6)
                }
            }
        }
    }
}))
