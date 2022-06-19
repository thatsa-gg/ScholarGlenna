import 'reflect-metadata'
import type { DiscordUserInfo } from './discord-rest'
import { DataSource } from 'typeorm'
import { User } from './models/User'

const {
    PGHOST: _POSTGRES_HOST,
    PGPORT: _POSTGRES_PORT,
    POSTGRES_DB: _POSTGRES_DB,
    POSTGRES_USER: _POSTGRES_USER,
    POSTGRES_PASSWORD: _POSTGRES_PASSWORD,
} = process.env
if(!_POSTGRES_HOST) throw `[env] Missing: PGHOST`
if(!_POSTGRES_PORT) throw `[env] Missing: PGPORT`
if(!_POSTGRES_DB) throw `[env] Missing: POSTGRES_DB`
if(!_POSTGRES_USER) throw `[env] Missing: POSTGRES_USER`
if(!_POSTGRES_PASSWORD) throw `[env] Missing: POSTGRES_PASSWORD`
export const POSTGRES_HOST: string = _POSTGRES_HOST
export const POSTGRES_PORT: number = Number.parseInt(_POSTGRES_PORT)
export const POSTGRES_DB: string = _POSTGRES_DB
export const POSTGRES_USER: string = _POSTGRES_USER
export const POSTGRES_PASSWORD: string = _POSTGRES_PASSWORD

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

export const Users = AppDataSource.getRepository(User).extend({
    async findOrCreate(info: DiscordUserInfo): Promise<User> {
        // TODO: make this more efficient and use a stored procedure
        const user = await this.findOneBy({ snowflake: info.id })
        if(user)
            return user
        return await this.save(new User(info))
    }
})
