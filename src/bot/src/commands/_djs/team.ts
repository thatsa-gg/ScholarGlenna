import { extend } from './_common.js'
import { Fetchers, Builders } from './_builder.js'

import { isTeamAuthorization } from '../_authorization.js'
import { database } from '../../util/database.js'
import { asArray } from '@glenna/util'
import { _snowflake } from './string.js'

const Team = Symbol('djs-team')
export function team(){
    return extend(_snowflake(), {
        type: Team,
        async autocomplete({ value }, interaction, authorization){
            if(!interaction.guild)
                return []
            return await database.team.autocompleteSnowflake(interaction.guild, interaction.user, value, isTeamAuthorization(authorization)
                ? asArray(authorization.team)
                : [ 'read' ])
        }
    })
}

Fetchers.set(Team, (name, required) => interaction => interaction.options.getString(name, required))
Builders.set(Team, (name, description, required, accessory) => builder => builder.addStringOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    option.setAutocomplete(true)
    if(description)
        option.setDescription(description)
    return option
}))
