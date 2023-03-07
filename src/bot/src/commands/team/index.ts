import { delegate } from '../_chat-command.js'

import { create } from './_create.js'
import { role } from './_role.js'
import { members } from './_members.js'
export const team = delegate({
    description: 'Raid team management commands',
    members: {
        create,
        role,
        members
    }
})
