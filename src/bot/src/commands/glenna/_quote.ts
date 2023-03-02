import { slashCommand, type SlashCommandHelper } from '../_schema.js'
import { randomFrom } from '@glenna/util'

export const quoteCommand: SlashCommandHelper = slashCommand({
    name: 'quote',
    description: 'Admire my brilliance.',
    async execute(_, interaction){
        await interaction.reply(randomFrom([
            `I can cast spells when absolutely needed, but for the most part you'll need to keep me alive.`,
            `Has everyone made peace with their gods, spirits, deities...or trees? Good.`,
            `Not *my* fault!`,
            `*Totally* not my fault.`,
            `Protect me. I'm about to try something.`,
            `I'm not your puppy!`,
            `There's an orb talking to me! Again!`
        ]))
    }
})
