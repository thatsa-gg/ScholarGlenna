import { delegate } from '../_chat-command.js'

import { create } from './_create.js'
export const division = delegate({
    description: 'Raid division management commands.',
    members: {
        create
    }
})
