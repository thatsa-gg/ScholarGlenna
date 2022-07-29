export type {
    Guild,
    User,
    UserProfile,
    Team
} from '../../generated/client'
export type { GuildDeletionSummary } from './Guilds.js'
export type { Client } from './Client.js'

import { getClient, type Client } from './Client.js'
import { Guilds } from './Guilds.js'
import { GuildMembers } from './GuildMembers.js'
import { Users } from './Users.js'
import { Profiles } from './Profiles.js'

export class Database {
    Client: Client
    Guilds: Guilds
    Users: Users
    Profiles: Profiles
    GuildMembers: GuildMembers
    private constructor(){
        this.Client = getClient()
        this.Guilds = new Guilds(this)
        this.Users = new Users(this)
        this.Profiles = new Profiles(this)
        this.GuildMembers = new GuildMembers(this)
    }

    static #instance: Database | null = null
    private static get Instance(): Database {
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
}
