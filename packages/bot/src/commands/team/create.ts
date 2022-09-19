import { Database } from '@glenna/common'
import { slugify } from '@glenna/util'
import { ChannelType } from 'discord.js'
import { SlashSubcommand } from '../../Command.js'

export default new SlashSubcommand({
    name: 'create',
    builder: (a) => a.setDescription('Create a new raid team.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Team name.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Team channel.')
                .addChannelTypes(ChannelType.GuildText))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Team role for member syncing and pinging.'))
        .addStringOption(option =>
            option.setName('alias')
                .setMinLength(1)
                .setMaxLength(32)
                .setDescription('Team alias (team name slug by default). Only alphanumeric characters and "-".'))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Team description.'))
        ,
    async execute(interaction){
        const sourceGuild = interaction.guild
        if(!sourceGuild){
            await interaction.reply({
                ephemeral: true,
                content: `This command must be executed in a guild.`
            })
            return
        }
        const guild = await Database.Client.guild.findUnique({ where: { snowflake: BigInt(sourceGuild.id) }})
        if(!guild){
            await interaction.reply({
                ephemeral: true,
                content: `I couldn't find your guild in my notes.`
            })
            return
        }

        const channel = interaction.options.getChannel('channel') || null
        const role = interaction.options.getRole('role') || null
        const name = interaction.options.getString('name', true)
        const description = interaction.options.getString('description') || null
        const alias = interaction.options.getString('alias')?.replace(/[^[A-Z0-9\-]+/g, '') || null
        const team = await Database.Teams.create({
            name, description,
            channel: channel ? BigInt(channel.id) : null,
            role: role ? BigInt(role.id) : null,
            alias: alias ?? slugify(name)
        }, sourceGuild, guild)
        await interaction.reply(`Raid team created! (id: ${team.team_id})`) // TODO: link
    }
})
