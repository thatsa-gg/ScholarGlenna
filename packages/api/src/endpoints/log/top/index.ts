import { router } from '../../../trpc.js'
import { findProcedure } from './_find.js'

export const topRouter = router({
    find: findProcedure
})
