import { Migration } from '../Migration.js'
export default new Migration(0, 'initial', {
    async execute(sql){
        const dateColumns = sql`
            created_at timestamp with time zone not null default now(),
            updated_at timestamp with time zone not null default now(),
            deleted_at timestamp with time zone default null
        `
        const createUpdateColumns = sql`
            created_at timestamp with time zone not null default now(),
            updated_at timestamp with time zone not null default now()
        `

        await sql`
            -- only 63 bits are used by the snowflake format.
            create domain snowflake as bigint check (value >= 0)
        `

        await sql`
            create table Users (
                user_id serial primary key,
                snowflake snowflake unique not null,
                username varchar(32) not null,
                discriminator smallint not null,
                ${ dateColumns }
            )
        `

        await sql`
            create table Profiles (
                profile_id serial primary key,
                user_id integer not null unique references Users(user_id),
                avatar varchar not null,
                ${ createUpdateColumns }
            )
        `

        await sql`
            create view UserProfiles as select
                Profiles.profile_id,
                Users.user_id,
                Users.snowflake,
                Users.username,
                Users.discriminator,
                Profiles.avatar,
                Profiles.updated_at,
                Profiles.created_at
            from
                Profiles inner join Users using(user_id)
        `

        await sql`
            create table GuildWars2Accounts (
                account_id serial primary key,
                user_id integer not null references Users(user_id) on delete cascade,
                api_key text,
                main boolean not null default FALSE,
                verified boolean not null default FALSE,
                ${ dateColumns }
            )
        `

        await sql`
            create table Guilds (
                guild_id serial primary key,
                snowflake snowflake unique not null,
                alias varchar(32) not null,
                name text not null,
                icon varchar,
                description text,
                preferred_locale varchar(5) not null,
                manager_role snowflake default null,
                moderator_role snowflake default null,
                ${ dateColumns }
            )
        `

        await sql`
            create unique index on Guilds (lower(alias))
        `

        await sql`
            create type GuildManagerRole as enum (
                'Owner',
                'Manager',
                'Moderator'
            )
        `

        await sql`
            create table GuildManagers (
                manager_id serial primary key,
                guild_id integer not null references Guilds(guild_id) on delete cascade,
                user_id integer not null references Users(user_id) on delete cascade,
                role GuildManagerRole not null default 'Moderator',
                constraint manager_unique_per_guild unique(guild_id, user_id)
            )
        `

        await sql`
            -- TODO: verify this on import.
            create table Teams (
                team_id serial primary key,
                guild_id integer not null references Guilds(guild_id) on delete cascade,
                role snowflake unique not null,
                name text not null,
                description text,
                time timestamp with time zone not null,
                duration time not null,
                color integer default null,
                icon varchar default null,
                channel snowflake default null,
                ${ dateColumns }
            )
        `

        await sql`
            create type TeamMemberRole as enum (
                'Member',
                'Permanent Fill',
                'Commander',
                'Moderator',
                'Manager'
            )
        `

        await sql`
            create type Visibility as enum (
                'Public',    -- always visible
                'Protected', -- only visible if in the same group
                'Members'    -- always private (basic team info may still be available in some groups)
            )
        `

        await sql`
            -- TODO: update this when a new user is added to a team or a user is removed from a team.
            -- TODO: update this when a user's guild nickname or guild avatar change
            -- TODO: verify this on import.
            create table GuildMembers (
                member_id serial primary key,
                user_id integer not null references Users(user_id),
                guild_id integer not null references Guilds(guild_id),
                nickname text,
                avatar varchar
            )
        `

        await sql`
            -- TODO: verify this on import.
            create table TeamMembers (
                member_id serial primary key,
                team_id integer not null references Teams(team_id) on delete cascade,
                user_id integer not null references Users(user_id), -- manually remove users if they get deleted. We need to send notifications!
                role TeamMemberRole not null default 'Member',
                visibility Visibility not null default 'Protected',
                nickname text,
                avatar varchar,
                ${ dateColumns },
                unique(team_id, user_id)
            )
        `

        // TODO: view to construct TeamMember info with fallback to underlying user.

        await sql`
            -- consider materializing this view for performance
            create view UserMemberships as select
                user_id,
                guild_id,
                cast(role as text)
            from GuildManagers
            union select distinct
                TeamMembers.user_id,
                Teams.guild_id,
                'TeamMember' as role
            from
                TeamMembers inner join Teams using (team_id)
        `
    }
})
