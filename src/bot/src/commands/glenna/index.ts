import { delegate } from '../_command.js'

import { github } from './_github.js'
import { quote } from './_quote.js'
import { version } from './_version.js'
import { import_ } from './import/index.js'

export const glenna = delegate({
    description: 'General info and management.',
    members: {
        github,
        quote,
        version,
        import: import_,
    }
})
