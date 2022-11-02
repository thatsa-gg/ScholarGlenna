import type * as Glenna from '@glenna/common'

type Alias = { alias: string }
type GuildAlias = { guild_alias: string }
type TeamAlias = { team_alias: string }
type TeamLookup = Pick<Glenna.TeamLookup, 'team_alias' | 'guild_alias'>
type Either<T1, T2> = (T1 & Partial<T2>) | (T2 & Partial<T1>)

const DISCORD_CDN = 'https://cdn.discordapp.com'

function guild(guild: Either<Alias, GuildAlias>): string {
    return `/${guild.guild_alias ?? guild.alias}`
}
guild.splash = function(guild: Pick<Glenna.Guild, 'snowflake' | 'splash'>, options?: Record<string, string | number>): string | null {
    if(!guild.splash)
        return null
    const base = `${DISCORD_CDN}/splashes/${guild.snowflake}/${guild.splash}.webp`
    if(options)
        return `${base}?${new URLSearchParams(options as Record<string, string>)}` // JS will coerce numbers to strings for us.
    return base
}
guild.settings = function(alias: Either<Alias, GuildAlias>): string {
    return `${guild(alias)}/-/settings`
}
guild.members = function(alias: Either<Alias, GuildAlias>): string {
    return `${guild(alias)}/-/members`
}

function team(...args: [ lookup: TeamLookup ] | [ guild: GuildAlias, team: Either<Alias, TeamAlias> | 'new' ]): string {
    const [ a, team ] = args
    if(!team)
        return `/${a.guild_alias}/${(a as TeamLookup).team_alias}`
    if('new' === team)
        return `/${a.guild_alias}/-/new-team`
    return `/${a.guild_alias}/${team.team_alias ?? team.alias}`
}

team.icon = function(team: Pick<Glenna.Team, 'role' | 'icon'>, options?: Record<string, string | number>): string | null {
    if(!team.role || !team.icon)
        return null
    const base = `${DISCORD_CDN}/role-icons/${team.role}/${team.icon}.webp`
    if(options)
        return `${base}?${new URLSearchParams(options as Record<string, string>)}`
    return base
}

team.settings = function(...args: [ lookup: TeamLookup ] | [ guild: GuildAlias, team: Either<Alias, TeamAlias> ]): string {
    return `${team(...args)}/-/settings`
}

export const url = {
    guild,
    team,
    avatar(avatar: Either<{ avatar: string }, { avatar_url_fragment?: string }>): string {
        return `${DISCORD_CDN}/${avatar.avatar_url_fragment ?? avatar.avatar}`
    },

}
