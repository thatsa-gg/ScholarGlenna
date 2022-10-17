import { Database } from '@glenna/common'
import type { Prisma } from '@glenna/prisma'
import type { FieldHistory } from '@glenna/util'
import { listener } from '../EventListener.js'

export default listener('guildUpdate', {
    async execute(oldGuild, newGuild){
        await Database.Client.$transaction(async client => {
            const snowflake = BigInt(newGuild.id)
            const changed: FieldHistory<Prisma.GuildUpdateInput>[] = []
            if(oldGuild.name !== newGuild.name)
                changed.push({
                    field: 'name',
                    old: oldGuild.name,
                    new: newGuild.name
                })
            if(oldGuild.description !== newGuild.description)
                changed.push({
                    field: 'description',
                    old: oldGuild.description,
                    new: newGuild.description
                })
            if(oldGuild.icon !== newGuild.icon)
                changed.push({
                    field: 'icon',
                    old: oldGuild.icon,
                    new: newGuild.icon
                })
            if(oldGuild.splash !== newGuild.splash)
                changed.push({
                    field: 'splash',
                    old: oldGuild.splash,
                    new: newGuild.splash
                })
            if(oldGuild.preferredLocale !== newGuild.preferredLocale)
                changed.push({
                    field: 'preferred_locale',
                    old: oldGuild.preferredLocale,
                    new: newGuild.preferredLocale
                })
            if(changed.length > 0){
                const data = Object.fromEntries(changed.map(({ field, new: value }) => [ field, value ])) as Prisma.GuildUpdateInput
                data.updated_at = new Date()
                await client.guild.update({ where: { snowflake }, data })
                await client.history.create({
                    data: {
                        event_type: 'GuildEdit',
                        actor_name: 'ScholarGlenna',
                        guild_snowflake: snowflake,
                        guild_name: newGuild.name,
                        data: changed
                    }
                })
            }
        })
    }
})
