import { slashCommandChildren, type SlashCommandHelper } from '../index.js'
import { divisionCreateCommand } from './_create.js'

export const divisionCommand: SlashCommandHelper = slashCommandChildren('team', {
    description: 'Raid division management.',
    children: {
        create: divisionCreateCommand
    }
})
