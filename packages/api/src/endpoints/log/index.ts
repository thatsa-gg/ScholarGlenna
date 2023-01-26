import { z } from 'zod'
import { router } from '../trpc.js'

import { submitProcedure } from './_submit.js'

export const logRouter = router({
    submit: submitProcedure
})
