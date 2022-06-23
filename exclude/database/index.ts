import { DataSource } from 'typeorm'
import * as User from '../models/User.js'
import * as Guild from '../models/Guild.js'
import * as GuildWars2Account from '../models/GuildWars2Account.js'
import * as GuildMember from '../models/GuildMember.js'
import * as Team from '../models/Team.js'
import * as TeamMember from '../models/TeamMember.js'

import {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD
} from '../env.js'

export { User, UserInfo, Profile, ProfileInfo } from '../models/User.js'
export { Guild, GuildInfo } from '../models/Guild.js'

interface AppDataRepositories {
    AppDataSource: DataSource
    Users: ReturnType<typeof User.getUserRepository>
    Profiles: ReturnType<typeof User.getProfileRepository>
    Guilds: ReturnType<typeof Guild.getRepository>
}
let instance: AppDataRepositories | null
export const initializeDatabase = async () => {
    if(instance)
        throw `Cannot initialize multiple times.`
    const AppDataSource = await new DataSource({
        type: 'postgres',
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
        entities: [
            User.User,
            User.Profile,
            Guild.Guild,
            GuildWars2Account.GuildWars2Account,
            GuildMember.GuildMember,
            Team.Team,
            TeamMember.TeamMember,
        ],
        synchronize: true, // TODO: disable this for production
        logging: false,
    }).initialize()
    return instance = {
        AppDataSource,
        Users: User.getUserRepository(AppDataSource),
        Profiles: User.getProfileRepository(AppDataSource),
        Guilds: Guild.getRepository(AppDataSource)
    }
}

export const getDataSource = async () => {
    if(!instance)
        await initializeDatabase()
    return instance!
}
