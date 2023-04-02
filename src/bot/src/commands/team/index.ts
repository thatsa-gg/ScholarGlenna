import { delegate } from '../_command.js'

import { create } from './_create.js'
import { role } from './_role.js'
import { update } from './_update.js'
import { info } from './_info.js'

import { time } from './time/index.js'
import { member } from './member/index.js'

export const team = delegate({
    description: 'Raid team management commands',
    members: {
        create,
        role,
        update,
        info,
        time,
        member,
    }
})
