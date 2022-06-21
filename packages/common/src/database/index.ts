import { DataSource } from 'typeorm'
import * as User from '../models/User.js'
import * as Guild from '../models/Guild.js'

import {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD
} from '../env.js'
export const AppDataSource = await new DataSource({
    type: 'postgres',
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    entities: [
        User.User,
        Guild.Guild,
    ],
    synchronize: true, // TODO: disable this for production
    logging: false,
}).initialize()

export { User, DiscordUserInfo } from '../models/User.js'
export const Users = User.getRepository(AppDataSource)

export { Guild } from '../models/Guild.js'
export const Guilds = Guild.getRepository(AppDataSource)
