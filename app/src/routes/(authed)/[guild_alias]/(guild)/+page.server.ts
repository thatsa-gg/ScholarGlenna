// @ts-nocheck
import { Database } from '@glenna/common'
import { error } from '@sveltejs/kit'
import { url } from '$lib/urls'
import { asRGB } from '@glenna/util'
import type { PageServerLoad } from './$types'

export const load = async ({ parent, params }: Parameters<PageServerLoad>[0]) => {
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
                    alias: true,
                    role: true,
                    color: true,
                    icon: true,
                }
            }
        }
    })
    if(!guild)
        throw error(404)
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
    const splash = url.guild.splash(guild, { size: 512 })
    return {
        user,
        guild: {
            name: guild.name,
            splash,
            splashProps: splash ? {
                width: 512,
                height: 288
            } : null,
            settingsUrl: url.guild.settings({ guild_alias }),
            membersUrl: url.guild.members({ guild_alias }),
            newTeamUrl: url.team({ guild_alias }, 'new'),
            teams: guild.teams.map(team => ({
                name: team.name,
                onTeam: teams.has(team.team_id),
                url: url.team({ guild_alias }, team),
                color: team.color ? asRGB(team.color) : undefined,
                icon: url.team.icon(team, { size: 32 }) ?? undefined,
            }))
        }
    }
}
