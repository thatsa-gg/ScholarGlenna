import { router } from '../../trpc.js'
import { findProcedure } from './_find.js'
import { getProcedure } from './_get.js'

export const teamRouter = router({
    get: getProcedure,
    find: findProcedure,
})
