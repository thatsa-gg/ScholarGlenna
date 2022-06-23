import { Snowflake } from './db'
type uuid = string
type session = {
    [access_key: `session_access_${uuid}`]: string
    [refresh_key: `session_refresh_${uuid}`]: string
    [user_id: `session_user_${uuid}`]: string
}
type guild_roles = {
    // not persistent, built from database on app launch
    // only roles in use by teams/guild settings
    [guild_roles: `guild_roles_${Snowflake<'guild'>}`]: Set<Snowflake<'role'>>
}
