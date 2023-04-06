export { type AppRouter, appRouter as router } from './router.js'
import { appRouter } from './router.js'

export type Caller = ReturnType<(typeof appRouter)['createCaller']>
export const trpc: Caller = appRouter.createCaller({})
