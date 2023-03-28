import { router } from '../../trpc.js'

import { findProcedure } from './_find.js'
import { submitProcedure } from './_submit.js'

export const logRouter = router({
    find: findProcedure,
    submit: submitProcedure,
})
