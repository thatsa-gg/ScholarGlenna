import { delegate } from '../_chat-command.js'

import { github } from './_github.js'
import { quote } from './_quote.js'
import { version } from './_version.js'

export const glenna = delegate({
    description: 'General info and management.',
    members: {
        github,
        quote,
        version,
    }
})
