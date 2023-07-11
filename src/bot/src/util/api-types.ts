import type { GuildMember, User } from "@glenna/discord"
import type { SimpleAPIGuildMember, SimpleAPIUser } from "@glenna/prisma"

export function asSimpleAPIUser(user: User): SimpleAPIUser {
    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
    }
}

export function asSimpleAPIGuildMember(member: GuildMember): SimpleAPIGuildMember {
    return {
        nick: member.nickname,
        avatar: member.avatar,
        user: asSimpleAPIUser(member.user)
    }
}
