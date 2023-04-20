import { asArray } from '@glenna/util'
import { database } from '../../../util/database.js'
import { isTeamAuthorization } from '../../_authorization.js'
import type { AutocompleteFn } from '../../_djs.js'

export enum Days {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export const AutocompleteTime: AutocompleteFn = async ({ value }, interaction, authorization) => {
    const team = interaction.options.getString('team')
    if(!team)
        return []
    return await database.teamTime.autocompleteId(interaction, BigInt(team), value, isTeamAuthorization(authorization) ? asArray(authorization.team) : [ 'readTime' ])
}
