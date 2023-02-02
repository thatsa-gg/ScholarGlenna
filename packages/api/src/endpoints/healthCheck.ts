import { z } from 'zod'
import { procedure } from '../trpc.js'

export const healthCheckProcedure = procedure
    .input(z.any().describe("echo"))
    .query(async ({ input }) => {
        return {
            healthCheck: true,
            date: new Date(),
            input
        }
    })
