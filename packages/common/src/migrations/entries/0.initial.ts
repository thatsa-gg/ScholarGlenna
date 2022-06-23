import { Migration } from '../Migration.js'
export default new Migration(0, 'initial', {
    async execute(sql){
        const dateColumns = sql`
            created_at timestamp with time zone not null default now(),
            updated_at timestamp with time zone not null default now(),
            deleted_at timestamp with time zone default null
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
                ${ dateColumns }
            )
        `

        await sql`
            create materialized view UserProfiles as select
                profile_id,
                user_id,
                snowflake,
                username,
                discriminator,
                avatar,
                Profiles.updated_at,
                Profiles.created_at,
                Profiles.deleted_at
            from
                Profiles inner join Users using(user_id)
        `

        await sql`
            create table GuildWars2Accounts (
                account_id serial primary key,
                user_id integer not null references Users(user_id),
                api_key text,
                verified boolean not null default FALSE,
                ${ dateColumns }
            )
        `

        await sql`
            create table Guilds (
                guild_id serial primary key,
                snowflake snowflake unique not null,
                name text not null,
                moderatorRole varchar default null,
                ${ dateColumns }
            )
        `

        await sql`
            create table GuildMembers (
                member_id serial primary key,
                user_id integer not null references Users(user_id),
                guild_id integer not null references Guilds(guild_id),
                nickname text,
                avatar varchar,
                ${ dateColumns },
                unique(user_id, guild_id)
            )
        `

        await sql`
            create table Teams (
                team_id serial primary key,
                guild_id integer not null references Guilds(guild_id),
                name text not null,
                description text,
                time timestamp with time zone not null,
                duration time not null,
                role snowflake not null,
                color varchar default null,
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
            create table TeamMembers (
                member_id serial primary key,
                team_id integer not null references Teams(team_id),
                user_id integer not null references Users(user_id),
                role TeamMemberRole not null default 'Member',
                ${ dateColumns }
            )
        `
    }
})
