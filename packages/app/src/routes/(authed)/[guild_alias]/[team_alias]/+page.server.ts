import { Database } from '@glenna/common'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { url } from '$lib/urls'
import { asRGB } from '@glenna/util'

function contrastColor(color: number): string {
    const red = (color | 0xff0000) >> 4
    const green = (color | 0xff00) >> 2
    const blue = color | 0xff
    const constrast = red * 0.299 + green * 0.587 + blue * 0.114
    if(constrast > 186)
        return 'black'
    else
        return 'white'
}

export const load: PageServerLoad = async ({ params, parent }) => {
    const { user } = await parent()
    const { guild_alias, team_alias } = params
    const lookup = await Database.Client.teamLookup.findUnique({
        where: { team_alias_guild_alias: { team_alias, guild_alias }},
        select: {
            team: {
                select: {
                    name: true,
                    role: true,
                    color: true,
                    icon: true,
                    members: {
                        select: {
                            role: true,
                            guild_member: {
                                select: {
                                    vmember: {
                                        select: {
                                            display_name: true,
                                            name: true,
                                            discriminator: true,
                                            avatar_url_fragment: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            guild: {
                select: {
                    alias: true,
                    name: true
                }
            }
        }
    })
    if(!lookup)
        throw error(404)
    const { team, guild } = lookup
    return {
        user,
        guild: {
            name: guild.name,
            url: url.guild(guild)
        },
        team: {
            name: team.name,
            color: team.color ? asRGB(team.color) : undefined,
            contrastColor: team.color ? contrastColor(team.color) : undefined,
            icon: url.team.icon(team, { size: 32 }) ?? undefined,
            settingsUrl: url.team.settings(params),
        },
        members: team.members.map(member => ({
            teamRole: member.role,
            name: member.guild_member.vmember!.name,
            discriminator: member.guild_member.vmember!.discriminator,
            displayName: member.guild_member.vmember!.display_name,
            avatar: url.avatar(member.guild_member.vmember!)
        }))
    }
}
