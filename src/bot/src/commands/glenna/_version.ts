import { VERSION } from '../../config.js'
import { slashSubcommand, type SlashSubcommandHelper } from '../index.js'

export const versionCommand: SlashSubcommandHelper = slashSubcommand('version', {
    builder(builder){
        return builder.setDescription('Return the current version of the bot.')
    },
    async execute(interaction){
        await interaction.reply(`This is Glenna v${VERSION}.`)
    }
})
