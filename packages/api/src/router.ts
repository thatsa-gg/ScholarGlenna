import { router, mergeRouters } from './trpc.js'

import { logRouter } from './endpoints/log/index.js'
import { guildRouter } from './endpoints/guild/index.js'
import { teamRouter } from './endpoints/team/index.js'
import { healthCheckProcedure } from './endpoints/healthCheck.js'

export const appRouter = router({
    log: logRouter,
    guild: guildRouter,
    team: teamRouter,
    healthCheck: healthCheckProcedure,
})
export type AppRouter = typeof appRouter
