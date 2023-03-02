import { z } from 'zod'
import { djs, slashCommand, type SlashCommandHelper } from '../_schema.js'
import { database } from '../../util/database.js'
import { ChannelType, EmbedBuilder } from '@glenna/discord'
import { slugify } from '@glenna/util'
import { debug } from '../../util/logging.js'

export const teamCreateCommand: SlashCommandHelper = slashCommand({
    name: 'create',
    description: 'Create a new raid team',
    authorized: true,
    input: z.object({
        name: z.string().describe('Team name.'),
        channel: djs.channel({ type: ChannelType.GuildText }).describe('Team channel'),
        role: djs.role().fetch().describe('Team role for member syncing and pinging.'),
        source: djs.guild()
    }),
    async execute({ name, channel, role, source }, interaction){
        const guild = await database.guild.lookupOrThrow(source, { id: true, divisions: { where: { primary: true }, select: { id: true }}})
        if(guild.divisions.length !== 1)
            throw `Fatal error: number of primary divisions in guild ${guild.id} is ${guild.divisions.length}`;
        const team = await database.team.create({
            data: {
                name,
                role: role ? BigInt(role.id) : null,
                channel: channel ? BigInt(channel.id) : null,
                alias: slugify(name),
                guild: { connect: { id: guild.id }},
                division: { connect: guild.divisions[0] }
            }
        })
        debug(`Create team "${team.name}" (${team.id}) in guild "${source.name}" (${guild.id})`)

        const members: string[] = []
        for(const member of role?.members.values() ?? []){
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

        const embed = new EmbedBuilder({
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

        // TODO: better response
        await interaction.reply({ embeds: [ embed ]})
    }
})
