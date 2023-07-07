import { database, profilePermission } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load = (async ({ locals }) => {
    const { session } = locals
    if(!session)
        return { user: null }

    const user = await database.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            alias: true,
            avatar: true,
            guildMemberships: {
                where: {
                    guild: {
                        lostRemoteReferenceAt: null,
                        permission: {
                            read: profilePermission(session.user)
                        }
                    }
                },
                orderBy: {
                    guild: {
                        name: 'asc'
                    }
                },
                select: {
                    guild: {
                        select: {
                            alias: true,
                            name: true,
                            isAuthorized: true,
                            inviteURL: true,
                            statistics: true,
                        }
                    },
                    teamMemberships: {
                        where: {
                            team: {
                                permission: {
                                    read: profilePermission(session.user)
                                }
                            }
                        },
                        orderBy: {
                            team: {
                                name: 'asc'
                            }
                        },
                        select: {
                            role: true,
                            team: {
                                select: {
                                    alias: true,
                                    name: true,
                                    icon: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if(!user)
        throw redirect(303, '/auth/signout')

    // manual copy done here to avoid "Symbol(nodejs.util.inspect.custom)"
    // added by Prisma when client extension properties are used.
    // Vite doesn't know how to serialize those
    return {
        user: {
            name: user.name,
            alias: user.alias,
            avatar: user.avatar,
            guilds: user.guildMemberships.map(membership => ({
                alias: membership.guild.alias,
                name: membership.guild.name,
                inviteURL: membership.guild.inviteURL,
                statistics: membership.guild.statistics,
                teams: membership.teamMemberships.map(membership => ({
                    role: membership.role,
                    alias: membership.team.alias,
                    name: membership.team.name,
                    icon: membership.team.icon,
                }))
            }))
        }
    }
}) satisfies LayoutServerLoad
