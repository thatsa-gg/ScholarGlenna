import { router, mergeRouters } from './trpc.js'

import { logRouter } from './endpoints/log/index.js'
import { guildRouter } from './endpoints/guild/index.js'

export const appRouter = mergeRouters(router({
    log: logRouter,
    guild: guildRouter,
}))
export type AppRouter = typeof appRouter
