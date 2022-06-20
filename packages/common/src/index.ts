import 'reflect-metadata'

export async function initializeDatabase(){}
export { UUID } from './UUID.js'

import { DataSource } from 'typeorm'
import { User, DiscordUserInfo } from './models/User.js'

import {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD
} from './env.js'
export const AppDataSource = await new DataSource({
    type: 'postgres',
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    entities: [
        User,
    ],
    synchronize: true, // TODO: disable this for production
    logging: false,
}).initialize()

export { User, DiscordUserInfo } from './models/User.js'
export const Users = AppDataSource.getRepository(User).extend({
    async findOrCreate(info: DiscordUserInfo): Promise<User> {
        // TODO: make this more efficient and use a stored procedure
        const user = await this.findOneBy({ snowflake: info.id })
        if(user)
            return user
        return await this.save(new User(info))
    }
})
