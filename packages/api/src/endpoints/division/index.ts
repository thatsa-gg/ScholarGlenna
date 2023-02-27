import { router } from '../../trpc.js'
import { findProcedure } from './_find.js'
import { getProcedure } from './_get.js'

export const divisionRouter = router({
    find: findProcedure,
    get: getProcedure,
})
