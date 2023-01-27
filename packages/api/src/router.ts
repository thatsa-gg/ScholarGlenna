import { router, mergeRouters } from './trpc.js'

import { logRouter } from './endpoints/log/index.js'
import { guildRouter } from './endpoints/guild/index.js'
import { teamRouter } from './endpoints/team/index.js'

export const appRouter = mergeRouters(router({
    log: logRouter,
    guild: guildRouter,
    team: teamRouter,
}))
export type AppRouter = typeof appRouter
