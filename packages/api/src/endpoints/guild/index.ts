import { router } from '../../trpc.js'
import { getProcedure } from './_get.js'
import { divisionsProcedure } from './_divisions.js'
import { teamsProcedure } from './_teams.js'

export const guildRouter = router({
    divisions: divisionsProcedure,
    teams: teamsProcedure,
    get: getProcedure,
//    topLogs: topLogsProcedure
})
