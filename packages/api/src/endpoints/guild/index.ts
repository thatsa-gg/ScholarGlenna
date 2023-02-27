import { router } from '../../trpc.js'
import { findProcedure } from './_find.js'
import { getProcedure } from './_get.js'

export const guildRouter = router({
    find: findProcedure,
    get: getProcedure,
})
