import type {
    Guild,
    Prisma,
    User
} from '../../generated/client'
import type { Database } from '.'

export class Import {
    #database: Database
    constructor(database: Database){ this.#database = database }

    async importGuilds(client: Prisma.TransactionClient, correlationId: bigint, options: { replace: boolean }): Promise<Map<string, Guild>> {
        const results = await client.$queryRaw<Guild[]>`select * from import_guilds(${correlationId}::snowflake, ${options.replace})`
        return new Map(results.map(guild => [guild.snowflake.toString(), guild]))
    }

    async importMembers(client: Prisma.TransactionClient, correlationId: bigint): Promise<void> {
        await client.$executeRaw`call import_members(${correlationId}::snowflake)`
    }

    async importCleanup(client: Prisma.TransactionClient): Promise<void> {
        await client.$executeRaw`call cleanup_import()`
    }
}
