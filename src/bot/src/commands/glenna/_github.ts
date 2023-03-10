import { subcommand } from '../_command.js'

export const github = subcommand({
    description: 'Fetch the link to my source code.',
    async execute(){
        return `You can find the secrets of the Eternal Alchemy at: https://github.com/cofl/ScholarGlenna`
    }
})
