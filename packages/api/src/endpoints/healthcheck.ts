import { z } from 'zod'
import { procedure } from '../trpc.js'

export const healthcheckProcedure = procedure
    .input(z.any().describe("echo"))
    .query(async ({ input }) => {
        return {
            healthcheck: true,
            date: new Date(),
            input
        }
    })
