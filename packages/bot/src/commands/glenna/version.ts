import { VERSION } from '../../config.js'
import { SlashSubcommand } from '../../Command.js'

export default new SlashSubcommand({
    name: 'version',
    builder: (a) => a.setDescription('Return the current version of the bot.'),
    async execute(interaction){
        await interaction.reply(`This is Glenna v.${VERSION}. Excelsior!`)
    }
})
