import { command } from '../_chat-command.js'

export const github = command({
    description: 'Fetch the link to my source code.',
    async execute(){
        return `You can find the secrets of the Eternal Alchemy at: https://github.com/cofl/ScholarGlenna`
    }
})
