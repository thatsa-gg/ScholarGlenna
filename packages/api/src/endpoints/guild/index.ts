import { router } from '../trpc.js'
import { teamsProcedure } from './_teams.js'

export const guildRouter = router({
    teams: teamsProcedure
})
