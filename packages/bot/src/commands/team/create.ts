import { Database } from '@glenna/common'
import { ChannelType } from 'discord-api-types/v10'
import { SlashSubcommand } from '../../SlashCommand.js'

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
                .setDescription('Team alias -- defaults to the slugified form of the team name.'))
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

        const channel = interaction.options.getChannel('channel')
        const role = interaction.options.getRole('role')
        const team = await Database.Teams.create({
            name: interaction.options.getString('name', true),
            description: null,
            channel: channel ? BigInt(channel.id) : null,
            role: role ? BigInt(role.id) : null,
            alias: interaction.options.getString('alias') ?? undefined
        }, sourceGuild, guild)
        await interaction.reply(`Raid team created! (id: ${team.team_id})`) // TODO: link
    }
})
