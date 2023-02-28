import { slashCommandChildren, type SlashCommandHelper } from '../index.js'
import { teamCreateCommand } from './_create.js'

export const teamCommand: SlashCommandHelper = slashCommandChildren('team', {
    description: 'Raid team management.',
    children: {
        create: teamCreateCommand
    }
})
