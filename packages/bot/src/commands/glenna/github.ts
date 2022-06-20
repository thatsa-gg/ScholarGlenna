import { SlashSubcommand } from '../../SlashCommand.js'

export default new SlashSubcommand({
    name: 'github',
    builder: (a) => a.setDescription('Return the URL to the source code.'),
    async execute(interaction){
        await interaction.reply(`You can find the secrets of the Eternal Alchemy at: https://github.com/cofl/ScholarGlenna`)
    }
})
