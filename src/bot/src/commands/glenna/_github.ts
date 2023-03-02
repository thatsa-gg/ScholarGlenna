import { slashCommand, type SlashCommandHelper } from '../_schema.js'

export const githubCommand: SlashCommandHelper = slashCommand({
    name: 'github',
    description: 'Return the URL to my source code.',
    async execute(_, interaction){
        await interaction.reply(`You can find the secrets of the Eternal Alchemy at: https://github.com/cofl/ScholarGlenna`)
    }
})
