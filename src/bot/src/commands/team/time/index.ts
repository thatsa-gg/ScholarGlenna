import { group } from '../../_command.js'

import { list } from './_list.js'
import { update } from './_update.js'
import { add } from './_add.js'
import { remove } from './_remove.js'

export const time = group({
    description: 'Modify team session times.',
    members: {
        list,
        update,
        add,
        remove
    }
})
