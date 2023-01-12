import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()
const procedure = t.procedure

export const appRouter = t.router({
    double: procedure
        .input(z.number())
        .query(({ input }) => input * 2)
})
export type AppRouter = typeof appRouter
