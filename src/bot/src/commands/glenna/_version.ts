import { subcommand } from '../_chat-command.js'
import { VERSION } from '../../config.js'

export const version = subcommand({
    description: 'Fetch the running version of my instructions.',
    async execute(){
        return `This is Glenna v${VERSION}.`
    }
})
