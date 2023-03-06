import { command } from '../_chat-command.js'
import { djs } from '../_djs.js'
import { z } from 'zod'
import { database } from '../../util/database.js'
import { slugify } from '@glenna/util'
import { debug } from '../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'

export const create = command({
    description: 'Create a new raid team',
    input: z.object({
        name: z.string().describe('Team name.'),
        channel: djs.channel().describe('Team channel.'),
        role: djs.role().describe('Team role for member syncing and pinging.'),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({
            id: true,
            divisions: {
                where: { primary: true },
                select: { id: true }
            }
        }))
    }),
    async execute({ name, channel, role, source, guild, guild: { divisions: [ division ]}}){
        if(!division)
            throw `Fatal error: guild ${guild.id} is missing a primary division!`
        const team = await database.team.create({
            data: {
                name,
                role: role ? BigInt(role.id) : null,
                channel: channel ? BigInt(channel.id) : null,
                alias: slugify(name),
                guild: { connect: { id: guild.id }},
                division: { connect: division }
            }
        })
        debug(`Create team "${team.name}" (${team.id}) in guild "${source.name}" (${guild.id})`)

        const members: string[] = []
        if(role){
            await source.members.fetch()
            const realizedRole = await source.roles.fetch(role.id)
            if(!realizedRole)
                throw `Could not fetch role with members!`
            for(const member of realizedRole.members.values()){
                const snowflake = BigInt(member.user.id)
                members.push(member.displayName)
                debug(`Adding "${member.displayName}" to "${team.name}".`)
                await database.teamMember.create({
                    data: {
                        role: 'Member',
                        team: { connect: { id: team.id }},
                        member: {
                            connectOrCreate: {
                                where: { snowflake_guildId: { snowflake, guildId: guild.id }},
                                create: {
                                    snowflake,
                                    name: member.nickname,
                                    icon: member.avatar,
                                    guild: { connect: { id: guild.id }},
                                    user: {
                                        connectOrCreate: {
                                            where: { snowflake },
                                            create: {
                                                snowflake,
                                                name: member.user.username,
                                                discriminator: member.user.discriminator,
                                                icon: member.user.avatar
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
        }

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name} created.`,
                    description: `${team.role ? `<@&${team.role}>` : team.name} has been registered.`,
                    fields: [
                        {
                            name: 'Members',
                            value: members.length > 0 ? members.map(a => `- ${a}`).join(`\n`) : `*Use \`/team add\` to add members to this team.*`
                        }
                    ]
                })
            ]
        }
    }
})
