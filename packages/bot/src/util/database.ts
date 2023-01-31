import { Database, type DatabaseClient } from '@glenna/prisma'
export const database: DatabaseClient = Database.create()
