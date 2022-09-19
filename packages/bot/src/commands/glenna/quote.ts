import { SlashSubcommand } from '../../Command.js'
import { randomFrom } from '@glenna/util'

export default new SlashSubcommand({
    name: 'quote',
    builder: (a) => a.setDescription('Admire my brilliance.'),
    async execute(interaction){
        await interaction.reply(randomFrom([
            `I can cast spells when absolutely needed, but for the most part you'll need to keep me alive.`,
            `Has everyone made peace with their gods, spirits, deities...or trees? Good.`,
            `Not *my* fault!`,
            `*Totally* not my fault.`,
            `Protect me. I'm about to try something.`,
            `I'm not your puppy!`,
        ]))
    }
})
