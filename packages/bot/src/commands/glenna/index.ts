import { slashCommandChildren, type SlashCommandHelper } from '../index.js'
import { githubCommand } from './_github.js'
import { quoteCommand } from './_quote.js'
import { versionCommand } from './_version.js'

export const glennaCommand: SlashCommandHelper = slashCommandChildren('glenna', {
    description: 'General info and management.',
    children: {
        github: githubCommand,
        quote: quoteCommand,
        version: versionCommand,
    }
})
