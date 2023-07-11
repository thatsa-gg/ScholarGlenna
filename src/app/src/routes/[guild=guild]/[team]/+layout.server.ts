import type { LayoutServerLoad } from "./$types"
import { database, DiscordCDN } from "$lib/server"
import { error } from "@sveltejs/kit"
import { permissionFragment } from "@glenna/prisma"

export const load = (async ({ params, locals }) => {
    const team = await database.team.findFirst({
        where: {
            guild: {
                alias: params.guild,
                permission: {
                    read: permissionFragment(locals.session?.user)
                }
            },
            alias: params.team,
            permission: {
                read: permissionFragment(locals.session?.user)
            }
        },
        select: {
            name: true,
            alias: true,
            guild: {
                select: {
                    snowflake: true,
                    name: true,
                    alias: true
                }
            },
            members: {
                select: {
                    role: true,
                    member: {
                        select: {
                            name: true,
                            icon: true,
                            user: {
                                select: {
                                    snowflake: true,
                                    name: true,
                                    alias: true,
                                    avatar: true,
                                    profile: {
                                        select: {
                                            buildRoles: true
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

    if(!team)
        throw error(404)

    return {
        context: [
            { name: team.guild.name, href: `/${team.guild.alias}` },
            { name: team.name, href: `/${team.guild.alias}/${team.alias}` }
        ],
        guild: {
            name: team.guild.name,
            alias: team.guild.alias,
        },
        team: {
            name: team.name,
            alias: team.alias,
            members: team.members.map(member => ({
                role: member.role,
                name: member.member.name ?? member.member.user.name,
                username: member.member.user.name,
                alias: member.member.user.alias,
                avatar: null !== member.member.icon
                    ? DiscordCDN.guildMemberAvatar(team.guild.snowflake.toString(), member.member.user.snowflake.toString(), member.member.icon)
                    : member.member.user.avatar,
                roles: {
                    heal: member.member.user.profile?.buildRoles?.heal,
                    healAlacrity: member.member.user.profile?.buildRoles?.healAlacrity,
                    healQuickness: member.member.user.profile?.buildRoles?.healQuickness,

                    healTank: member.member.user.profile?.buildRoles?.healTank,
                    healTankAlacrity: member.member.user.profile?.buildRoles?.healTankAlacrity,
                    healTankQuickness: member.member.user.profile?.buildRoles?.healTankQuickness,

                    dpsPower: member.member.user.profile?.buildRoles?.dpsPower,
                    dpsPowerAlacrity: member.member.user.profile?.buildRoles?.dpsPowerAlacrity,
                    dpsPowerQuickness: member.member.user.profile?.buildRoles?.dpsPowerQuickness,

                    dpsCondition: member.member.user.profile?.buildRoles?.dpsCondition,
                    dpsConditionAlacrity: member.member.user.profile?.buildRoles?.dpsConditionAlacrity,
                    dpsConditionQuickness: member.member.user.profile?.buildRoles?.dpsConditionQuickness,

                    dpsTank: member.member.user.profile?.buildRoles?.dpsTank,
                    dpsTankAlacrity: member.member.user.profile?.buildRoles?.dpsTankAlacrity,
                    dpsTankQuickness: member.member.user.profile?.buildRoles?.dpsTankQuickness,

                    handKite: member.member.user.profile?.buildRoles?.handKite,
                    bloodScourge: member.member.user.profile?.buildRoles?.bloodScourge,
                    qadimLamp: member.member.user.profile?.buildRoles?.qadimLamp,
                    qadimKite: member.member.user.profile?.buildRoles?.qadimKite,
                    pylonKite: member.member.user.profile?.buildRoles?.pylonKite,
                    shPusher: member.member.user.profile?.buildRoles?.shPusher,
                }
            }))
        }
    }
}) satisfies LayoutServerLoad
