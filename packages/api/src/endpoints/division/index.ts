import { router } from '../../trpc.js'
import { getProcedure } from './_get.js'

export const divisionRouter = router({
    get: getProcedure,
})
