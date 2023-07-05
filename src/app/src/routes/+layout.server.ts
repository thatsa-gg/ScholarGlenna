import { getSession } from '$lib/server/session'
import { database, profilePermission } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load = (async ({ cookies }) => {
    const sessionID = cookies.get('session_id')
    if(!sessionID)
        return { user: null }

    const session = await getSession(sessionID)
    if(!session)
        throw redirect(303, '/auth/signout')

    const profile = await database.profile.findUnique({
        where: { id: session.profileId },
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    alias: true,
                    avatar: true,
                    guildMemberships: {
                        where: {
                            guild: {
                                lostRemoteReferenceAt: null,
                                permission: {
                                    read: profilePermission(session)
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
                                            read: profilePermission(session)
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
            }
        }
    })
    if(!profile)
        throw redirect(303, '/auth/signout')

    // manual copy done here to avoid "Symbol(nodejs.util.inspect.custom)"
    // added by Prisma when client extension properties are used.
    // Vite doesn't know how to serialize those
    return {
        user: {
            id: profile.user.id,
            name: profile.user.name,
            avatar: profile.user.avatar,
            guilds: profile.user.guildMemberships.map(membership => ({
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
