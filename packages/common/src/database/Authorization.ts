import type {
    Guild,
    GuildMember,
    Team,
    TeamMember,
    User
} from '@glenna/prisma'
import { assertExhaustive } from '@glenna/util'
import type { Database } from '.'

interface PermissionParameters {
    ['CREATE_TEAM']: [ guild: Pick<Guild, 'guild_id'> ]
}

function pickGuild(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>){
    return {
        where: {
            guild_id: guild.guild_id,
            user_id: user.user_id,
        }
    }
}

export type AuthorizationLevel =
    | 'CanOwn'
    | 'CanEdit'
    | true
    | false
function mapGuildRole({ role }: Pick<GuildMember, 'role'>): AuthorizationLevel {
    switch(role){
        case 'Owner':
            return 'CanOwn'
        case 'Moderator':
        case 'Manager':
            return 'CanEdit'
        case null:
            return true
    }
    return assertExhaustive(role)
}
function mapTeamRole({ role }: Pick<TeamMember, 'role'>): AuthorizationLevel {
    switch(role){
        case 'Member':
        case 'Representative':
        case 'Permanent_Fill':
            return true
    }
    return assertExhaustive(role)
}

export class Authorization {
    #database: Database
    constructor(database: Database){ this.#database = database }

    level(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>): Promise<any>;
    level(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>, team: Pick<Team, 'team_id'>): Promise<any>;
    async level(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>, team?: Pick<Team, 'team_id'>): Promise<any> {
        const guildLevel = await this.#database.Client.guildMember.findUnique({
            where: {
                user_id_guild_id: {
                    user_id: user.user_id,
                    guild_id: guild.guild_id
                }
            },
            select: {
                guild_member_id: true,
                role: true
            }
        })
        if(null === guildLevel)
            return false
        if(!team)
            return mapGuildRole(guildLevel)
        const teamLevel = await this.#database.Client.teamMember.findUnique({
            where: {
                team_id_guild_member_id: {
                    team_id: team.team_id,
                    guild_member_id: guildLevel.guild_member_id
                }
            },
            select: {
                role: true
            }
        })
        if(!teamLevel)
            return false
        return true
    }

    async guildView(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>): Promise<boolean> {
        return 0 < await this.#database.Client.guildMember.count(pickGuild(user, guild))
    }

    async teamCreate(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>): Promise<boolean> {
        return 0 < await this.#database.Client.guildManager.count(pickGuild(user, guild))
    }
}
