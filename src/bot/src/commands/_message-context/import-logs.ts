import Papa from 'papaparse'
import { message } from '../_command.js'
import { actions, button, select } from '../_actions.js'
import { StringSelectMenuInteraction } from '@glenna/discord'
import { error, info, warn } from '../../util/logging.js'
import { database } from '../../util/database.js'
import { trpc } from '@glenna/api'
import { z } from 'zod'
import { slugify } from '@glenna/util'

const TEN_MINUTES_MS = 10 * 60 * 1000
const VALID_LOG_URL = /^(?:https:\/\/)?(?:(?:(?:www|a|b)\.)?dps\.report\/[a-zA-Z0-9_-]+|gw2wingman\.nevermindcreations\.de\/log\/[a-zA-Z0-9_-]+)$/
export const importLogs = message({
    async execute(message, guild, interaction){
        const attachments = message.attachments.filter(attachment => /^text\/csv(?:; .*)?/.test(attachment.contentType ?? ''))
        if(attachments.size === 0)
            throw `No CSV attachments on this message!`
        if(attachments.size > 1)
            throw `Multiple attachments are currently not supported.`
        const response = await fetch(attachments.at(0)!.url)
        const csv = Papa.parse<object>(await response.text(), { header: true, skipEmptyLines: 'greedy' })
        if(csv.errors)
            throw new Error(JSON.stringify(csv.errors))
        const data = csv.data
        if(data.length === 0)
            throw `No data found.`
        const keys = Object.keys(data[0]!).filter(key => key).map(key => ({ label: key, value: key }))

        const reply = await interaction.reply({
            ephemeral: true,
            content: `What are the columns?`,
            components: [
                actions.select(
                    select('date', 'Date Column', ...keys),
                    select('team', 'Team Name', ...keys),
                    select('logs', 'Log Columns', ...keys).setMinValues(1).setMaxValues(keys.length - 2),
                    select('unknownTeam', 'Unknown teams?',
                        { label: 'Create', value: 'create', default: true },
                        { label: 'Skip', value: 'skip' }
                    )
                ),
                actions.buttons(
                    button.primary('submit', 'Submit')
                )
            ]
        })

        let dateKey: string | null = null
        let teamKey: string | null = null
        let logKeys: string[] | null = null
        let skipUnkown: boolean = false

        while(true){
            const response = await reply.awaitMessageComponent({
                filter: a => a.user.id == interaction.user.id,
                time: TEN_MINUTES_MS
            })
            if(response.customId === 'submit'){
                if(dateKey === null || teamKey === null || logKeys === null)
                    continue
                break
            }
            if(!(response instanceof StringSelectMenuInteraction)){
                warn(`import-logs: received non-select interaction ${response.customId}`)
                continue
            }
            switch(response.customId){
                case 'date':
                    dateKey = response.values[0] ?? null
                    break
                case 'team':
                    teamKey = response.values[0] ?? null
                    break
                case 'unknownTeam':
                    skipUnkown = (response.values[0] ?? null) === 'skip'
                    break
                case 'logs':
                    logKeys = response.values
                    break
                default:
                    warn(`import-logs: received unknown select interaction ${response.customId}`)
            }
        }

        const dbGuild = await database.guild.findUniqueOrThrow({
            where: { snowflake: BigInt(guild.id) },
            select: {
                id: true,
                divisions: {
                    where: { primary: true },
                    select: {
                        id: true
                    }
                }
            }
        })
        const division = dbGuild.divisions[0]
        if(!division)
            throw `import-logs: Could not find primary division for guild ${dbGuild.id}`
        const teams = new Map(await database.team.findMany({
            where: { guild: { id: dbGuild.id }},
            select: {
                name: true,
                snowflake: true
            }
        }).then(results => results.map(({ name, snowflake }) => [ name.toLowerCase(), snowflake ])))

        let createdTeams = 0
        let createdLogs = 0
        const errors: string[] = []
        function err(message: string){
            errors.push(message)
            error(message)
        }

        for(let idx = 0; idx < data.length; idx += 1){
            const row = data[idx] as any
            const teamName = row[teamKey!]
            if(!teamName){
                err(`import-logs: Missing team in column "${teamKey}" on row ${idx}`)
                continue
            }
            const teamNameIdx = teamName.toLowerCase()
            if(!teams.has(teamNameIdx)){
                if(skipUnkown){
                    info(`import-logs: skipping unknown team "${teamName}"`)
                    continue
                }
                info(`import-logs: creating unknown team "${teamName}"`)

                const team = await database.team.create({
                    data: {
                        name: teamName,
                        alias: slugify(teamName),
                        guild: { connect: { id: dbGuild.id } },
                        division: { connect: { id: division.id }}
                    },
                    select: {
                        snowflake: true
                    }
                })
                teams.set(teamNameIdx, team.snowflake)
                createdTeams += 1
            }
            const team = teams.get(teamNameIdx)!

            const date = z.date({ coerce: true }).safeParse(row[dateKey!])
            if(!date.success){
                err(`import-logs: Missing or invalid date in column "${dateKey}" on row ${idx}`)
                continue
            }
            const submittedAt = date.data

            for(const key of logKeys){
                const value = row[key]
                if(!value)
                    continue
                if(typeof value !== 'string' || !VALID_LOG_URL.test(value)){
                    err(`import-logs: Log in column "${key}" on row ${idx} is not a valid DPS.Report or GW2Wingman link: ${value}`)
                    continue
                }

                try {
                    await trpc.log.submit({
                        team, submittedAt, logs: [ value ]
                    })
                    createdLogs += 1
                } catch(e) {
                    err(`import-logs: API Error: \`\`\`json\n${JSON.stringify(e)}\n\`\`\``)
                    continue
                }
            }
        }
        return {
            content: [
                `Imported ${createdLogs} logs (created ${createdTeams} teams).`,
                errors.length > 0 ? undefined : `Errors:`,
                ...errors.map(err => `- ${err}`)
            ].filter(a => a).join('\n'),
            components: []
        }
    }
})
