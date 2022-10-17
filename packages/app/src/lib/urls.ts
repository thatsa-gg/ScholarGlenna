import { error } from '@sveltejs/kit'

type Alias = { alias: string }
type GuildAlias = { guild_alias: string }
type TeamAlias = { team_alias: string }
type Either<T1, T2> = (T1 & Partial<T2>) | (T2 & Partial<T1>)
type URLArguments =
    | [ 'guild', Either<Alias, GuildAlias> ]
    | [ 'avatar', Either<{ avatar: string}, { avatar_url_fragment?: string }> ]
    | [ 'team', GuildAlias, Either<Alias, TeamAlias> | 'new' ]
export function url(...args: URLArguments){
    const [ type, p0, p1, ...prest ] = args
    switch(type){
        case 'guild': return `/${p0.guild_alias ?? p0.alias}`
        case 'avatar': return `https://cdn.discordapp.com/${p0.avatar ?? p0.avatar_url_fragment}`
        case 'team':
            if('new' === p1)
                return `/${p0.guild_alias}/-/new-team`
            return `/${p0.guild_alias}/${p1.team_alias ?? p1.alias}`
        default:
            throw error(500)
    }
}
