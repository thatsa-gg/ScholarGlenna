import { Database } from '@glenna/common'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { url } from '$lib/urls'

export const load: PageServerLoad = async ({ params, parent }) => {
    const { user } = await parent()
    const { guild_alias, team_alias } = params
    const lookup = await Database.Client.teamLookup.findUnique({
        where: { team_alias_guild_alias: { team_alias, guild_alias }},
        select: {
            team: {
                select: {
                    name: true,
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
            name: team.name
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
