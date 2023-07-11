import { djs } from '../../_djs.js'
import { database } from '../../../util/database.js'
import { isTeamAuthorization } from '../../_authorization.js'
import { asArray } from '@glenna/util'
import type { TeamPermissions } from '@glenna/prisma'

export function teamMember(teamKey?: string){
    return djs.autocomplete(djs.snowflake(), {
        async autocomplete({ value }, interaction, authorization){
            if(!interaction.guild)
                return []
            const key = isTeamAuthorization(authorization) ? authorization.key : teamKey
            if(!key)
                throw `Could not find team key for looking up member!`
            const team = interaction.options.getString(key)
            const snowflake = null !== team && /^\d+$/.test(team) ? BigInt(team) : null
            const permissions = asArray<TeamPermissions>(isTeamAuthorization(authorization) ? authorization.team : 'read')
            return await database.teamMember.autocompleteSnowflake(interaction.guild, interaction.user, snowflake, value, permissions)
        }
    })
}
