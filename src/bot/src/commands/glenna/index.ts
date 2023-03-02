import { slashCommandGroup, type SlashCommandGroup } from '../_schema.js'
import { githubCommand } from './_github.js'
import { quoteCommand } from './_quote.js'
import { versionCommand } from './_version.js'

export const glennaCommand: SlashCommandGroup = slashCommandGroup({
    name: 'glenna',
    description: 'General info and management.',
    children: [
        githubCommand,
        quoteCommand,
        versionCommand,
    ]
})
