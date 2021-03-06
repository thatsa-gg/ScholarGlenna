import { LazyPromise } from '@glenna/util'
import postgres, { Sql, TransactionSql } from 'postgres'
import {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD
} from '../env.js'
import { UserRepository } from './UserRepository.js'
import { ProfileRepository } from './ProfileRepository.js'
import { GuildRepository } from './GuildRepository.js'

export interface Transactable {
    transaction?: TransactionSql<{}> | Sql<{}>
}
export type DataSource = {
    Users: UserRepository
    Profiles: ProfileRepository
    Guilds: GuildRepository
}
export const AppDataSource: LazyPromise<DataSource> = LazyPromise.from(() => {
    const sql = postgres({
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
    })

    const dataSource: DataSource = {} as DataSource
    dataSource.Users = new UserRepository(sql, dataSource)
    dataSource.Profiles = new ProfileRepository(sql, dataSource)
    dataSource.Guilds = new GuildRepository(sql, dataSource)
    return dataSource
})
