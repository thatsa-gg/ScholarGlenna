import { delegate } from '../_command.js'

import { create } from './_create.js'
import { role } from './_role.js'
import { time } from './time/index.js'

export const team = delegate({
    description: 'Raid team management commands',
    members: {
        create,
        role,
        time,
    }
})
