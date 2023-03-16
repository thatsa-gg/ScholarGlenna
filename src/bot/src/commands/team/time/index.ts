import { group } from '../../_command.js'

import { list } from './_list.js'
export const time = group({
    description: 'Modify team session times.',
    members: {
        list
    }
})
