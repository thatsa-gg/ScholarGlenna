import { info, debug } from '../util/logging.js'
import { database } from '../util/database.js'
import { sendWelcomeMessage } from '../util/guild.js'
import { listener } from '../EventListener.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID } from '../config.js'
import { registerCommands } from '../commands/index.js'
import type { Prisma } from '@glenna/prisma'
import { DiscordAPIError } from 'discord.js'

function isUserOrMemberNotFoundError(e: any): e is (DiscordAPIError & { code: 10013 | 10007 }) {
    if(!(e instanceof DiscordAPIError))
        return false
    if(typeof e.code !== 'number')
        return false
    return e.code === 10007 || e.code === 10013
}

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
        const presentData = new Map(await database.guild.findMany({
            where: { lostRemoteReferenceAt: null },
            select: {
                id: true,
                snowflake: true,
                name: true,
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
                        id: true,
                        name: true,
                        icon: true,
                        lostRemoteReferenceAt: true,
                        user: {
                            select: {
                                snowflake: true,
                                name: true,
                                discriminator: true,
                                icon: true
                            }
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
        }).then(results => results.map(result => [ result.snowflake.toString(), result ])))

        debug({
            message: `Fetched guild data`,
            presentData
        })
        debug(`Create new guilds.`)
        for(const guild of client.guilds.cache.filter((_, k) => !presentData.has(k)).values()){
            await database.guild.import(guild)
            //await sendWelcomeMessage(guild) // TODO: restore welcome message once testing is complete
        }

        debug(`Update existing guilds.`)
        for(const [ guild, target ] of client.guilds.cache.map((v, k) => [ v, presentData.get(k) ] as const)){
            if(!target)
                continue

            const data: Prisma.GuildUpdateInput = {}
            if(guild.name !== target.name)
                data.name = target.name
            if(Object.keys(data).length > 0)
                await database.guild.update({ where: { id: target.id }, data })
            for(const team of target.teams.filter(team => team.role !== null || team.channel !== null)){
                const data: Prisma.TeamUpdateInput = {}
                if(team.role !== null && !await guild.roles.fetch(team.role.toString()))
                    data.role = null
                if(team.channel !== null && !await guild.channels.fetch(team.channel.toString()))
                    data.channel = null
                if(Object.keys(data).length > 0)
                    await database.team.update({ where: { id: team.id }, data })
            }
            for(const member of target.members){
                try {
                    const guildMember = await guild.members.fetch(member.user.snowflake.toString())
                    const data: Prisma.GuildMemberUpdateInput = {}
                    const user: Prisma.UserUpdateOneRequiredWithoutGuildMembershipsNestedInput['update'] = {}
                    if(null !== member.lostRemoteReferenceAt)
                        data.lostRemoteReferenceAt = null
                    if(guildMember.avatar !== member.icon)
                        data.icon = guildMember.avatar
                    if(guildMember.nickname !== member.name)
                        data.name = guildMember.nickname
                    if(guildMember.user.username !== member.user.name)
                        user.name = guildMember.user.username
                    if(guildMember.user.discriminator !== member.user.discriminator)
                        user.discriminator = guildMember.user.discriminator
                    if(guildMember.user.avatar !== member.user.icon)
                        user.icon = guildMember.user.avatar
                    if(Object.keys(user).length > 0)
                        data.user = { update: user }
                    if(Object.keys(data).length > 0)
                        await database.guildMember.update({ where: { id: member.id }, data })
                } catch(e) {
                    if(!isUserOrMemberNotFoundError(e))
                        throw e
                    await database.guildMember.update({ where: { id: member.id }, data: { lostRemoteReferenceAt: new Date() }})
                }
            }
            await database.user.prune()
        }

        info(`Registering commands.`)
        for(const guild of client.guilds.cache.values()){
            await registerCommands({
                token: DISCORD_TOKEN,
                clientId: OAUTH_CLIENT_ID,
                guildId: guild.id
            })
        }

        client.user.setActivity(`/glenna help`)
        info(`Startup complete.`)
    }
})
