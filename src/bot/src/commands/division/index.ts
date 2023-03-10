import { delegate } from '../_command.js'

import { create } from './_create.js'
export const division = delegate({
    description: 'Raid division management commands.',
    members: {
        create
    }
})
