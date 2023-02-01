import { database } from '../../util/database.js'
import { ChannelType } from 'discord.js'
import { slashSubcommand, type SlashSubcommandHelper } from '../index.js'
import { slugify } from '@glenna/util'

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

        const channel = interaction.options.getChannel('channel') || null
        const role = interaction.options.getRole('role') || null
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

        if(role){
            const guild = await database.guild.findUniqueOrThrow({ where: { snowflake: guildSnowflake }, select: { id: true }})
            const real = await interaction.guild.roles.fetch(role.id)
            if(!real)
                throw new Error() // TODO
            for(const member of real.members.values()){
                const snowflake = BigInt(member.user.id)
                await database.user.upsert({
                    where: { snowflake },
                    create: {
                        snowflake,
                        name: member.user.username,
                        discriminator: member.user.discriminator,
                        icon: member.user.avatar,
                        guildMemberships: {
                            create: {
                                guildId: guild.id,
                                name: member.nickname,
                                icon: member.avatar,
                                teamMemberships: {
                                    create: {
                                        role: 'Member',
                                        teamId: team.id
                                    }
                                }
                            }
                        }
                    },
                    update: {
                        name: member.user.username,
                        discriminator: member.user.discriminator,
                        icon: member.user.avatar,
                        guildMemberships: {
                            connectOrCreate: {
                                where: { user: { snowflake } }
                            }
                        }
                    }
                })
            }
        }

        // TODO: better response
        await interaction.reply(`Raid team created! (id: ${team.id})`)
    }
})
