import { subcommand } from '../_command.js'
import { randomFrom } from '@glenna/util'

export const quote = subcommand({
    description: 'Admire my brilliance.',
    async execute(){
        return randomFrom([
            `I can cast spells when absolutely needed, but for the most part you'll need to keep me alive.`,
            `Has everyone made peace with their gods, spirits, deities...or trees? Good.`,
            `Not *my* fault!`,
            `*Totally* not my fault.`,
            `Protect me. I'm about to try something.`,
            `I'm not your puppy!`,
            `There's an orb talking to me! Again!`
        ])
    }
})
