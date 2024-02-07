import { Guild, Team } from "$lib/server/database"
import { error } from "@sveltejs/kit"
import { ClientAppUrl } from "$lib/url"
import { AppUrl } from "$lib/server/url.js"

function groupBy<T, R>(items: readonly T[], key: (item: T) => string, value: (item: T) => R): Record<string, R[]> {
    const result: Record<string, R[]> = {}
    for(const item of items){
        const k = key(item)
        const v = value(item)

        const list = result[k] ??= []
        list.push(v)
    }
    return result
}

export async function load({ locals, params }){
    const user = locals.session?.user ?? null
    const guild = await Guild.lookup(locals.connection, user, params.guild)
    if(!guild)
        return error(404, "Guild not found.") // or not visible
    const teams = await Team.getVisible(locals.connection, user, guild)
    return {
        guild,
        teams: Object.fromEntries(Object.entries(groupBy(teams, team => team.leagueName ?? "", team => ({
            name: team.name,
            kind: team.kind,
            url: AppUrl.team(guild, team.name)
        }))).map(pair => [ pair[0], { teams: pair[1] }])),
        context: [
            { name: "Guild", href: ClientAppUrl.Guilds },
            { name: guild.name }
        ]
    }
}
