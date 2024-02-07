import { CDN } from "@discordjs/rest"
import { RouteBases } from "discord-api-types/v10"

export namespace AppUrl {
    export const DiscordCDN = new CDN()

    // User
    export function user(user: Pick<Glenna.User, "name">){ return `/@${user.name}` }
    export function userLogs(user: Pick<Glenna.User, "name">){ return `${AppUrl.user(user)}/logs` }
    export namespace Discord {
        export function avatar(user: {
            discordId: bigint | string,
            avatar?: string | null,
        }){
            if(user.avatar){
                return DiscordCDN.avatar(user.discordId.toString(), user.avatar, {
                    extension: "webp"
                })
            } else {
                // https://discord.com/developers/docs/reference#image-formatting
                return DiscordCDN.defaultAvatar(Number((BigInt(user.discordId) >> 22n) % 6n))
            }
        }
    }

    // Guild
    type RawGuild = { vanityCode: string | null, lookupAlias: string }
    export function guild(guild: RawGuild): string
    export function guild(param: string): string
    export function guild(item: string | RawGuild){
        if(typeof item === "string")
            return `/guild/${item}`
        return `/guild/${item.vanityCode ?? item.lookupAlias}`
    }

    export function guildInvite(guild: Pick<RawGuild, "vanityCode">){
        if(!guild.vanityCode)
            return null
        return `${RouteBases.invite}/${guild.vanityCode}`
    }

    export function guildLogs(guild: RawGuild){ return `/guild/${guild.vanityCode ?? guild.lookupAlias}/logs` }
    export function guildSettings(guild: RawGuild){ return `/guild/${guild.vanityCode ?? guild.lookupAlias}/settings` }

    export function icon(entity: {
        id: string,
        iconHash: string | null,
    }){
        if(null == entity.iconHash)
            return null
        return {
            url: DiscordCDN.icon(entity.id, entity.iconHash, { extension: "webp" }),
            static: DiscordCDN.icon(entity.id, entity.iconHash, { extension: "webp", forceStatic: true })
        }
    }

    // Team
    export function teams(guild: RawGuild){ return `/guild/${guild.vanityCode ?? guild.lookupAlias}/teams` }
    export function team(guild: Glenna.Guild, team: string){
        const slug = team.toLowerCase().replace(/[^a-z0-9_\-]/g, '-')
        return `/team/${guild.slug}/${slug}`
    }
}
