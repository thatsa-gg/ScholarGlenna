import { router } from '../../trpc.js'

import { submitProcedure } from './_submit.js'
import { topLogsProcedure } from './_topLogs.js'

export const logRouter = router({
    submit: submitProcedure,
    topLogs: topLogsProcedure
})
