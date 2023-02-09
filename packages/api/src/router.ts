import { router } from './trpc.js'

import { logRouter } from './endpoints/log/index.js'
import { guildRouter } from './endpoints/guild/index.js'
import { teamRouter } from './endpoints/team/index.js'
import { divisionRouter } from './endpoints/division/index.js'
import { healthcheckProcedure } from './endpoints/healthcheck.js'

export const appRouter = router({
    log: logRouter,
    division: divisionRouter,
    guild: guildRouter,
    team: teamRouter,
    healthcheck: healthcheckProcedure,
})
export type AppRouter = typeof appRouter
