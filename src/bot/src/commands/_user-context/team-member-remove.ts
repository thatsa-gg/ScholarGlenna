import { ComponentType, EmbedBuilder } from '@glenna/discord'
import { database } from '../../util/database.js'
import { actions, select } from '../_actions.js'
import { user } from '../_command.js'

const TEN_MINUTES_MS = 10 * 60 * 1000
export const teamMemberRemove = user({
    async execute(member, source, interaction){
        // TODO
    }
})
