import { info, debug } from '../util/logging.js'
import { database } from '../util/database.js'
import { listener } from '../EventListener.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID, VERSION } from '../config.js'
import { registerCommands } from '../Command.js'

export const readyListener = listener('ready', {
    once: true,
    async execute(client){
        client.user.setAFK()
        debug(`Beginning startup.`)
        client.setMaxListeners(Infinity)

        info(`Performing consistency check.`)
        const validGuildSnowflakes = client.guilds.cache.map((_, key) => BigInt(key))
        await database.$transaction(async database => {
            debug(`Marking inactive guilds.`)
            await database.guild.updateMany({
                data: { lostRemoteReferenceAt: new Date() },
                where: {
                    snowflake: { notIn: validGuildSnowflakes },
                    lostRemoteReferenceAt: null
                }
            })

            debug(`Unmarking re-activated guilds.`)
            await database.guild.updateMany({
                data: { lostRemoteReferenceAt: null },
                where: {
                    snowflake: { in: validGuildSnowflakes },
                    lostRemoteReferenceAt: { not: null }
                }
            })
        })

        debug(`Reading present data from database.`)
        const presentData = await database.guild.findMany({
            where: { lostRemoteReferenceAt: { not: null }},
            select: {
                snowflake: true,
                teams: {
                    select: {
                        id: true,
                        type: true,
                        role: true,
                        channel: true,
                        icon: true,
                    }
                },
                members: {
                    select: {
                        name: true,
                        icon: true,
                        user: {
                            snowflake: true,
                            name: true,
                            discriminator: true,
                            icon: true
                        },
                        teamMemberships: {
                            select: {
                                team: { select: { id: true }},
                                role: true
                            }
                        }
                    }
                }
            }
        })

        debug(`Importing valid guilds.`)
        for(const guild of client.guilds.cache.values()){
            // TODO: import guild properties
            // TODO: validate owner
            // TODO: validate moderators
            // TODO: retrieve teams
            const teams: any[] = []
            for(const team of teams){
                // TODO: validate team role
                // TODO: validate team channel
                // TODO: validate team members
            }
        }

        info(`Registering commands.`)

        client.user.setActivity(`/glenna help`)
        info(`Startup complete.`)
    }
})

export default listener('ready', {
    once: true,
    async execute(client){
        info('Beginning startup...')
        client.setMaxListeners(Infinity)
        client.user.setActivity(`Starting up v.${VERSION}`)

        info('Importing guilds...')
        const guilds = await Database.Guilds.import([...client.guilds.cache.values()], { replace: true })

        log()
        log('Guilds marked for deletion are:')
        log(`\tID        Snowflake           Name`)
        log(`\t----------------------------------------`)
        const markedGuilds = await Database.Client.guild.findMany({ where: { deleted_at: { not: null }}})
        for(const guild of markedGuilds)
            log(`\t${guild.guild_id.toString().padEnd(9)} ${guild.snowflake.toString().padEnd(19)} ${guild.name}`)
        if(0 === markedGuilds.length)
            log(`\t(none)`)

        log()
        info('Registering commands...')
        for(const guild of guilds){
            log(`\tRegistering commands on: ${guild.name}`)
            await registerCommands({
                token: DISCORD_TOKEN,
                clientId: OAUTH_CLIENT_ID,
                guildId: guild.snowflake
            })
        }

        client.user.setActivity(`/glenna help`)
        info('Startup complete!')
    }
})
