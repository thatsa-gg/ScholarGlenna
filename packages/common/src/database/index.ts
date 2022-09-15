export type {
    Guild,
    User,
    UserProfile,
    Team
} from '../../generated/client'
export type { GuildDeletionSummary } from './Guilds.js'
export type { Client } from './Client.js'
export type { TeamInfo } from './Teams.js'
export { Guilds } from './Guilds.js'

import { getClient, type Client } from './Client.js'
import { Guilds } from './Guilds.js'
import { GuildMembers } from './GuildMembers.js'
import { Users } from './Users.js'
import { Profiles } from './Profiles.js'
import { Teams } from './Teams.js'
import { Authorization } from './Authorization.js'
import { Import } from './Import.js'

export class Database {
    Client: Client
    Guilds: Guilds
    Users: Users
    Profiles: Profiles
    GuildMembers: GuildMembers
    Teams: Teams
    Authorization: Authorization
    Import: Import
    private constructor(){
        this.Client = getClient()
        this.Guilds = new Guilds(this)
        this.Users = new Users(this)
        this.Profiles = new Profiles(this)
        this.GuildMembers = new GuildMembers(this)
        this.Teams = new Teams(this)
        this.Authorization = new Authorization(this)
        this.Import = new Import(this)
    }

    newSnowflake(): Promise<bigint>
    newSnowflake(options: { asString: true }): Promise<string>
    async newSnowflake(options?: { asString: true }): Promise<bigint | string> {
        const result = await this.Client.$queryRaw<[{ snowflake: bigint }]>`select new_snowflake() as snowflake;`
        if(options?.asString)
            return result[0].snowflake.toString(36)
        else
            return result[0].snowflake
    }

    static #instance: Database | null = null
    static get Instance(): Database {
        if(!this.#instance){
            console.debug(`Instantiating Database singleton.`)
            return this.#instance = new Database()
        }
        return this.#instance
    }
    static get Client(): Client { return this.Instance.Client }
    static get Guilds(): Guilds { return this.Instance.Guilds }
    static get Users(): Users { return this.Instance.Users }
    static get Profiles(): Profiles { return this.Instance.Profiles }
    static get GuildMembers(): GuildMembers { return this.Instance.GuildMembers }
    static get Teams(): Teams { return this.Instance.Teams }
    static get Authorization(): Authorization { return this.Instance.Authorization }
    static get Import(): Import { return this.Instance.Import }
}
