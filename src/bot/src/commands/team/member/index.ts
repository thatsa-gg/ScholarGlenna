import { group } from '../../_command.js'

import { list } from './_list.js'
import { add } from './_add.js'
import { remove } from './_remove.js'
import { update } from './_update.js'

export const member = group({
    description: 'Modify or retrieve team members.',
    members: {
        list,
        add,
        remove,
        update,
    }
})
