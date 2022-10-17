import { Database } from '@glenna/common'
import { error } from '@sveltejs/kit'
import { url } from '$lib/urls'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent, params }) => {
    const { user } = await parent()
    const { guild_alias } = params
    const guild = await Database.Client.guild.findUnique({
        where: { alias: guild_alias },
        select: {
            name: true,
            snowflake: true,
            splash: true,
            teams: {
                select: {
                    team_id: true,
                    name: true,
                    alias: true
                }
            }
        }
    })
    const me = await Database.Client.user.findUnique({
        where: { user_id: user.user_id },
        select: {
            team_memberships: {
                select: {
                    team_id: true
                }
            }
        }
    })
    const teams = new Set(me?.team_memberships.map(m => m.team_id));
    if(!guild)
        throw error(404)
    return {
        user,
        guild: {
            name: guild.name,
            splash: guild.splash ? `https://cdn.discordapp.com/splashes/${guild.snowflake}/${guild.splash}.webp?size=1024` : null,
            newTeamUrl: url('team', { guild_alias }, 'new'),
            teams: guild.teams.map(team => ({
                ...team,
                onTeam: teams.has(team.team_id),
                url: url('team', { guild_alias }, team)
            }))
        }
    }
}
