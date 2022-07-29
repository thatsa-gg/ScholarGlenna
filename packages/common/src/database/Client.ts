import { PrismaClient, type Prisma } from "../../generated/client/index.js"

export type Transactionable = { client?: PrismaClient | Prisma.TransactionClient }
export type Client = PrismaClient
// TODO: middleware for soft delete
export const getClient = (): Client => new PrismaClient()
