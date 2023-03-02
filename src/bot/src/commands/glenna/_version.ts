import { VERSION } from '../../config.js'
import { slashCommand, type SlashCommandHelper } from '../_schema.js'

export const versionCommand: SlashCommandHelper = slashCommand({
    name: 'version',
    description: 'Return the current version of the bot.',
    async execute(_, interaction){
        await interaction.reply(`This is Glenna v${VERSION}.`)
    }
})
