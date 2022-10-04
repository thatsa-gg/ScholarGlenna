import { PrismaClient, type Prisma } from '@glenna/prisma'

export type Transactionable = { client?: PrismaClient | Prisma.TransactionClient }
export type Client = PrismaClient
// TODO: middleware for soft delete
export const getClient = (): Client => new PrismaClient()
