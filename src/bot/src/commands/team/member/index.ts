import { group } from '../../_command.js'

import { list } from './_list.js'
export const member = group({
    description: 'Modify or retrieve team members.',
    members: {
        list
    }
})
