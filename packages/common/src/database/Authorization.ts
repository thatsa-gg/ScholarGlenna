import type {
    Guild,
    User
} from '@glenna/prisma'
import type { Database } from '.'

interface PermissionParameters {
    ['CREATE_TEAM']: [ guild: Pick<Guild, 'guild_id'> ]
}

export class Authorization {
    #database: Database
    constructor(database: Database){ this.#database = database }

    async teamCreate(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>): Promise<boolean> {
        return 0 < await this.#database.Client.guildManager.count({
            where: {
                guild_id: guild.guild_id,
                user_id: user.user_id,
            }
        })
    }
}
