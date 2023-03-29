import { group } from '../../_command.js'

import { list } from './_list.js'
import { update } from './_update.js'

export const time = group({
    description: 'Modify team session times.',
    members: {
        list,
        update
    }
})
