import { DataSource as ORMDataSource } from 'typeorm'

const {
    POSTGRES_HOST,
    POSTGRES_DATABASE,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
} = process.env

export const DataSource = await new ORMDataSource({
    type: 'postgres',
    host: POSTGRES_HOST,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
}).initialize()
