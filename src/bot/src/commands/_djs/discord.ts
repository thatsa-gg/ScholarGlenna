import { Fetchers, Builders, Ignore } from './_builder.js'
import { custom } from './_common.js'
import {
    Guild,
    GuildMember,
    Role,
    User,
} from '@glenna/discord'

const DjsRole = Symbol('djs-role')
export function role(){
    return custom<Role>(DjsRole, c => c instanceof Role)
}
Fetchers.set(DjsRole, (name, required) => interaction => interaction.options.getRole(name, required))
Builders.set(DjsRole, (name, description, required, accessory) => builder => builder.addRoleOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))

const DjsGuild = Symbol('djs-guild')
export function guild(){
    return custom<Guild>(DjsGuild, c => c instanceof Guild)
}
Fetchers.set(DjsGuild, () => interaction => interaction.guild)
Builders.set(DjsGuild, Ignore)

const DjsUser = Symbol('djs-user')
export function user(){
    return custom<User>(DjsUser, c => c instanceof User)
}
Fetchers.set(DjsUser, (name, required) => interaction => interaction.options.getUser(name, required))
Builders.set(DjsUser, (name, description, required, accessory) => builder => builder.addUserOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))

const DjsActor = Symbol('djs-actor')
export function actor(){
    return custom<GuildMember>(DjsActor, c => c instanceof GuildMember, "Cannot find actor guild member.")
}
Fetchers.set(DjsActor, () => interaction => interaction.member)
Builders.set(DjsActor, Ignore)

const DjsMentionable = Symbol('djs-mentionable')
export function mentionable(){
    return custom<Role | User | GuildMember>(DjsMentionable, c => c instanceof User || c instanceof GuildMember || c instanceof Role)
}
Fetchers.set(DjsMentionable, (name, required) => interaction => interaction.options.getMentionable(name, required))
Builders.set(DjsMentionable, (name, description, required, accessory) => builder => builder.addMentionableOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))
