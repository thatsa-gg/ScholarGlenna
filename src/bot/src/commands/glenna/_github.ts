import { slashSubcommand, type SlashSubcommandHelper } from '../index.js'

export const githubCommand: SlashSubcommandHelper = slashSubcommand('version', {
    builder(builder){
        return builder.setDescription('Return the URL to my source code.')
    },
    async execute(interaction){
        await interaction.reply(`You can find the secrets of the Eternal Alchemy at: https://github.com/cofl/ScholarGlenna`)
    }
})
