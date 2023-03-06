import { delegate } from '../_chat-command.js'

import { create } from './_create.js'
export const team = delegate({
    description: 'Raid team management commands',
    members: {
        create
    }
})
