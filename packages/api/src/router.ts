import { z } from 'zod'
import { router, procedure, mergeRouters } from './trpc.js'

import { teamRouter } from './endpoints/team.js'

export const appRouter = mergeRouters(router({
    team: teamRouter
}))
export type AppRouter = typeof appRouter
