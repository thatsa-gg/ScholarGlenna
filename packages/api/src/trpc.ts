import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { ZodTypeAny } from 'zod'

const trpc = initTRPC.create()

export const router = trpc.router
export const procedure = trpc.procedure
export const mergeRouters = trpc.mergeRouters

export function scalarOrArray<T extends ZodTypeAny>(a: T){
    return z.union([
        a,
        a.array().min(1)
    ])
}
