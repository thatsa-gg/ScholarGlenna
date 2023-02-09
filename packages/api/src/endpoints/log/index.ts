import { router } from '../../trpc.js'

import { topRouter } from './top/index.js'
import { findProcedure } from './_find.js'
import { submitProcedure } from './_submit.js'

export const logRouter = router({
    top: topRouter,
    find: findProcedure,
    submit: submitProcedure,
})
