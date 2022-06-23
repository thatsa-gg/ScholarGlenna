type serial = number
export type Snowflake<T extends string> = string | T
interface Entity {
    id: serial
    created_at: Date,
    updated_at: Date,
    deleted_at: Date | null,
}

interface Guild extends Entity {
    snowflake: Snowflake<'guild'>
    name: string
    owner: User
    moderator_role: Snowflake<'role'>
    members: GuildMember[]
    teams: Team[]
}

interface GuildMember extends Entity {
    nickname: string
    avatar: string
    user: User
    guild: Guild
}

interface User extends Entity {
    snowflake: Snowflake<'user'>
    username: string
    discriminator: string
    memberships: GuildMember[]
    profile: Profile | null
    accounts: GuildWars2Account[]
}

interface GuildWars2Account extends Entity {
    name: string
    apiKey: string
    verified: boolean
    user: User
}

interface Profile extends Entity {
    avatar: string
    // TODO
}

interface Team extends Entity {
    name: string
    description: string
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
    time: 'time with time zone'
    color: string
    icon: string//url
    channel: Snowflake<'channel'>
    role: Snowflake<'role'>
    guild: Guild
}

interface AuditLog {
    id: serial
    created_at: Date
    created_by: User
    entity: Team | Guild | User
    action: string
    targetType: 'reference' | 'string'
    targetReference: Team | Guild | User | null
    targetString: 'role name' | 'channel name' | 'field name' | null
    value: string | null
    // e.g. [moderator, Team, add, User, null, null]
    //      [owner, Guild, create, null, null, null]
    //      [owner, Guild, set, null, 'description', 'example']
}

/*
interface Tag {
    id: serial
    type: 'guild' | 'team'
    name: string
    description: string
}

interface Tagged {
    tag: Tag
    type: Tag['type']
    on: Guild | Team
    added_on: Date
}
*/

type TeamMemberType =
    | 'member'          // standard user
    | 'permanent fill'  // standard user, does not count toward roster cap
    | 'commander'       // member, can manage compositions
    | 'moderator'       // team-specific moderator, does not count toward any caps
    | 'manager'         // team-specific moderator, counts toward roster cap
interface TeamMember extends Entity {
    user: User
    type: TeamMemberType
}

interface FightLog {
    id: serial
    created_at: Date
    updated_at: Date
    // TODO
}
