import { ChannelType } from 'discord-api-types/v10'
import { SlashSubcommand } from '../../SlashCommand.js'

export default new SlashSubcommand({
    name: 'create',
    builder: (a) => a.setDescription('Create a new raid team.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Team name (unique per guild).')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Team channel.')
                .addChannelTypes(ChannelType.GuildText))
        .addMentionableOption(option =>
            option.setName('group')
                .setDescription('Team mention group.'))
        ,
    async execute(interaction){
        console.log({
            name: interaction.options.get('name'),
            channel: interaction.options.get('channel'),
            group: interaction.options.get('group'),
        })
        await interaction.reply(`Raid team created!`)
    }
})
