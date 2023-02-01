type Alias = { alias: string }
type GuildAlias = { guild_alias: string }
type TeamAlias = { team_alias: string }
type TeamLookup = any // Pick<Glenna.TeamLookup, 'team_alias' | 'guild_alias'>
type Either<T1, T2> = (T1 & Partial<T2>) | (T2 & Partial<T1>)

const DISCORD_CDN = 'https://cdn.discordapp.com'

function guild(guild: Either<Alias, GuildAlias>): string {
    return `/${guild.guild_alias ?? guild.alias}`
}
guild.splash = function(guild: any, options?: Record<string, string | number>): string | null {
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

function team(...args: [ lookup: TeamLookup ] | [ guild: Either<Alias, GuildAlias>, team: Either<Alias, TeamAlias> | 'new' ]): string {
    const [ a, team ] = args
    if(!team)
        return `${guild(a)}/${(a as TeamLookup).team_alias}`
    if('new' === team)
        return `${guild(a)}/-/new-team`
    return `${guild(a)}/${team.team_alias ?? team.alias}`
}

team.icon = function(team: any, options?: Record<string, string | number>): string | null {
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
    avatar: {
        guild(avatar: Either<{ avatar: string }, { avatar_url_fragment?: string }>): string {
            return `${DISCORD_CDN}/${avatar.avatar_url_fragment ?? avatar.avatar}`
        },
        user(user: { snowflake: bigint, avatar: string | null }, options?: Record<string, string | number>): string {
            const { snowflake, avatar } = user
            const base = avatar
                ? `${DISCORD_CDN}/avatars/${snowflake}/${avatar}.png`
                : `${DISCORD_CDN}/embed/avatars/${snowflake % 5n}.png`
            return options
                ? `${base}?${new URLSearchParams(options as Record<string, string>)}`
                : base
        }
    }
}
