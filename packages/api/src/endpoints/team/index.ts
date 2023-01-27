import { router } from '../../trpc.js'

import { topLogsProcedure } from './_topLogs.js'

export const teamRouter = router({
    topLogs: topLogsProcedure
})
