import { slashCommandChildren, type SlashCommandHelper } from '../index.js'
import { teamCreateCommand } from './_create2.js'

export const teamCommand: SlashCommandHelper = slashCommandChildren('team', {
    description: 'Raid team management.',
    children: {
        create: teamCreateCommand
    }
})
