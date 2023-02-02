import { database } from '../../util/database.js'
import { ChannelType, EmbedBuilder } from 'discord.js'
import { slashSubcommand, type SlashSubcommandHelper } from '../index.js'
import { slugify } from '@glenna/util'
import { debug } from '../../util/logging.js'

export const teamCreateCommand: SlashSubcommandHelper = slashSubcommand('create', {
    builder(builder){
        return builder.setDescription('Create a new raid team.')
            .addStringOption(o => o.setName('name').setDescription('Team name.').setRequired(true))
            .addChannelOption(o => o.setName('channel').setDescription('Team channel.').addChannelTypes(ChannelType.GuildText))
            .addRoleOption(o => o.setName('role').setDescription('Team role for member syncing and pinging.'))
    },
    async execute(interaction){
        const sourceGuild = interaction.guild
        if(!sourceGuild){
            await interaction.reply({
                ephemeral: true,
                content: `This command must be executed in a guild.`
            })
            return
        }

        const channel = interaction.options.getChannel('channel')
        const role = interaction.options.getRole('role')
        const name = interaction.options.getString('name', true)

        const guildSnowflake = BigInt(sourceGuild.id)
        const team = await database.team.create({
            data: {
                name,
                channel: channel ? BigInt(channel.id) : null,
                role: role ? BigInt(role.id) : null,
                alias: slugify(name),
                guild: { connect: { snowflake: guildSnowflake }}
            }
        })
        debug(`Create team "${team.name}" (${team.id}) in guild "${sourceGuild.name}" (${sourceGuild.id})`)

        const members: string[] = []
        if(role){
            const guild = await database.guild.findUniqueOrThrow({ where: { snowflake: guildSnowflake }, select: { id: true }})
            await interaction.guild.members.fetch() // awful hack to load all the user info so the next line works as expected.
            const real = await interaction.guild.roles.fetch(role.id)
            if(!real)
                throw new Error() // TODO
            for(const member of real.members.values()){
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
