set check_function_bodies = false;
create schema if not exists public;
create domain snowflake as bigint check (value >= 0);


-------------------------------------------------------------------------------
---                                                                         ---
---                 Utility Functions                                       ---
---                                                                         ---
-------------------------------------------------------------------------------

create sequence public.GlobalSnowflakeSequence minvalue 0 maxvalue 4095 cycle; -- [0, 2^12)
create function new_snowflake() returns snowflake language 'plpgsql' as $body$
declare
    epoch bigint := 1640995200000;
    shard_mask bigint := ((inet_server_addr() & inet '0.0.3.255') - inet '0.0.0.0') << 12;
begin
    return ((floor((extract(epoch from clock_timestamp()) - epoch) * 1000)::bigint & 2199023255551::bigint) << 22) -- 2^41-1
        | shard_mask
        | nextval('public.GlobalSnowflakeSequence');
end;
$body$;

-------------------------------------------------------------------------------
---                                                                         ---
---                 Tables/Types                                            ---
---                                                                         ---
-------------------------------------------------------------------------------

create type AuditLogTarget as enum (
    'User',
    'Profile',
    'Guild',
    'GuildMember',
    'Team',
    'TeamMember'
);

create type AuditLogAction as enum (
    'Create',
    'Update',
    'Delete'
);

create table AuditLogs (
    log_id serial primary key,
    created_at timestamp with time zone not null default now(),
    target_type AuditLogTarget not null,
    action_type AuditLogAction not null
);

-------------------------------------------------------------------------------

create table Users (
    user_id serial primary key,
    snowflake snowflake unique not null,
    username varchar(32) not null,
    discriminator smallint not null,
    avatar varchar default null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table Profiles (
    profile_id serial primary key,
    user_id integer not null unique references Users(user_id) on delete cascade,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table GuildWars2Accounts (
    account_id serial primary key,
    user_id integer not null references Users(user_id) on delete cascade,
    api_key text,
    main boolean not null default FALSE,
    verified boolean not null default FALSE,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table Guilds (
    guild_id serial primary key,
    snowflake snowflake unique not null,
    alias varchar(32) unique not null,
    name text not null,
    icon varchar,
    description text,
    preferred_locale varchar(5) not null,
    manager_role snowflake default null,
    moderator_role snowflake default null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone default null
);
create unique index on Guilds (lower(alias));

create type GuildRole as enum (
    'Owner',
    'Manager',
    'Moderator'
);

-- TODO: update this when a new user is added to a team or a user is removed from a team.
-- TODO: update this when a user's guild nickname or guild avatar change
-- TODO: verify this on import.
create table GuildMembers (
    guild_member_id serial primary key,
    user_id integer not null references Users(user_id) on delete cascade,
    guild_id integer not null references Guilds(guild_id) on delete cascade,
    role GuildRole default null,
    nickname text,
    avatar varchar,
    created_at timestamp with time zone not null default now(), -- join time, as seen by Glenna
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone default null -- soft delete so we can track team members who have left.
);

create view GuildManagers as select
    guild_member_id,
    guild_id,
    user_id,
    role
from GuildMembers where role is not null;

create view GuildOwners as select
    guild_member_id,
    guild_id,
    user_id
from GuildMembers where role = 'Owner';

-- TODO: verify on import
create table Teams (
    team_id serial primary key,
    guild_id integer not null references Guilds(guild_id) on delete cascade,
    snowflake snowflake unique not null,
    alias varchar(32) not null,
    name text not null,
    description text,
    role snowflake unique default null,
    sync boolean not null default FALSE, -- TODO: actually sync if this is true and we have a role.
    channel snowflake default null,
    color integer default null, -- from role
    icon varchar default null, -- from role
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);
create unique index on Teams (guild_id, lower(alias));

create table TeamTimes (
    time_id serial primary key,
    team_id integer references Teams(team_id) on delete cascade,
    time timestamp with time zone not null,
    duration time not null
);

create type TeamMemberRole as enum (
    'Member',
    'Permanent Fill',
    'Commander',
    'Moderator',
    'Manager'
);

create type Visibility as enum (
    'Public',    -- always visible
    'Protected', -- only visible if in the same group
    'Members'    -- always private (basic team info may still be available in some groups)
);

create table TeamMembers (
    member_id serial primary key,
    team_id integer not null references Teams(team_id) on delete cascade,
    guild_member_id integer not null references GuildMembers(guild_member_id) on delete cascade,
    role TeamMemberRole not null default 'Member',
    visibility Visibility not null default 'Protected',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    unique(team_id, guild_member_id)
);

create view TeamMemberships as select
    TeamMembers.team_id,
    GuildMembers.user_id
from TeamMembers inner join GuildMembers using(guild_member_id);

-- This is a count of all users that either have a role, or are active members of a team.
create view GuildMemberReferenceCount as with targets as (
    select
        guild_member_id,
        user_id,
        1 as weight
    from GuildMembers
    where role is not null
    union all select
        GuildMembers.guild_member_id,
        GuildMembers.user_id,
        1 as weight
    from TeamMembers inner join GuildMembers using(guild_member_id)
    where GuildMembers.deleted_at is null
) select
    guild_member_id,
    user_id,
    coalesce(sum(weight), 0) as Count
from targets
group by guild_member_id, user_id;

-- This is a count of all user references, including guild member references
create view UserReferenceCount as with targets as (
    select user_id, 1 as weight from Profiles
    union all select user_id, Count as weight from GuildMemberReferenceCount
)
select
    Users.user_id,
    coalesce(sum(weight), 0) as Count
from
    Users left outer join targets using(user_id)
group by
    Users.user_id;

-------------------------------------------------------------------------------
---                                                                         ---
---                 Convenience Views                                       ---
---                                                                         ---
-------------------------------------------------------------------------------

create view UserIcons as select
    user_id,
    snowflake,
    coalesce(
        'avatars/' || snowflake::Text || '/' || avatar,
        'embed/avatars/' || (discriminator % 5) || '.png'
    ) as avatar
from Users;

create view GuildMemberIcons as select
    Users.user_id,
    GuildMembers.guild_member_id,
    coalesce(
        'guilds/' || Guilds.snowflake::text || '/users/' || UserIcons.snowflake::text || '/avatars/' || GuildMembers.avatar,
        UserIcons.avatar
    ) as avatar
from
    GuildMembers
    inner join UserIcons using(user_id)
    inner join Guilds using(guild_id);

create view GuildIcons as with initial as (
    select
        Guilds.guild_id,
        Guilds.icon as icon_hash,
        'icons/' || Guilds.snowflake::text || Guilds.icon as icon
    from Guilds
)
select
    guild_id,
    icon,
    case when icon_hash like 'a_%' then icon || '.gif' else null end as icon_gif
from initial;

create view TeamLookup as select
    Teams.team_id,
    Teams.guild_id,
    Teams.alias as team_alias,
    Guilds.alias as guild_alias,
    Teams.name,
    Teams.color,
    Teams.icon
from
    Teams inner join Guilds using(guild_id);

create view vGuildMember as with initial as (
    select
        Users.user_id,
        GuildMembers.guild_id,
        GuildMembers.guild_member_id,
        Users.snowflake::text as snowflake,
        GuildMemberIcons.avatar as avatar_url_fragment,
        coalesce(GuildMembers.nickname, Users.username) as name,
        lpad(Users.discriminator::text, 4, '0') as discriminator,
        GuildMembers.role,
        GuildMembers.deleted_at
    from
        GuildMembers
        inner join Users using(user_id)
        inner join GuildMemberIcons using(guild_id)
)
select
    user_id,
    guild_id,
    guild_member_id,
    snowflake,
    avatar_url_fragment,
    name,
    discriminator,
    concat(name, '#', discriminator) as display_name,
    role,
    deleted_at
from initial;

-------------------------------------------------------------------------------
---                                                                         ---
---                 Import Tables                                           ---
---                                                                         ---
--- These should be empty outside of transactions.                          ---
-------------------------------------------------------------------------------

create table ImportGuilds (
    snowflake snowflake primary key,
    vanity varchar(32),
    alias varchar not null,
    name text not null,
    icon varchar
    description text,
    preferred_locale varchar(5) not null
);

create table ImportGuildMembers (
    snowflake snowflake,
    guild_id integer not null references Guilds(guild_id),
    username varchar(32) not null,
    discriminator smallint not null,
    nickname text,
    user_avatar varchar,
    guild_avatar varchar,
    role GuildRole,
    primary key(snowflake, guild_id)
);

create table ImportTeamMembers (
    snowflake snowflake,
    team_id integer primary key references Teams(team_id),
    primary(snowflake, team_id)
);

/*
    hypothetical procedure:
    - import guilds.
    - "import" teams (from existing guilds).
    - import team members for teams where sync = true
    - update existing users.
    - update existing guild members.
    - create new users for teams
    - create new guild members for teams
    - add guild members to teams
    - remove guild members from teams where guild members are still in guild
    - note deletion information for guild members:
        1. on teams, where the user left the guild
        2. with roles, where the user left the guild
    - delete guild member objects where the user left the guild
    - prune the user table
*/

-- for import, should be empty outside of transactions.
create table KeepGuildMembers (
    snowflake snowflake,
    guild_id integer not null references Guilds(guild_id),
    username varchar(32) not null,
    discriminator smallint not null,
    nickname text,
    avatar varchar,
    role GuildRole,
    primary key(snowflake, guild_id)
);

-- for import, should be empty outside of transactions.
create table DeletedGuildMembers (
    snowflake snowflake,
    guild_id integer not null references Guilds(guild_id),
    name text not null,
    nickname text,
    primary key(snowflake, guild_id)
);
-------------------------------------------------------------------------------
---                                                                         ---
---                 Procedures and Functions                                ---
---                                                                         ---
-------------------------------------------------------------------------------

create function import_guilds(replace boolean) returns Guilds
begin atomic
    -- restore guilds
    update Guilds set
        deleted_at = null,
        updated_at = now(),
        name = ImportGuilds.name,
        icon = ImportGuilds.icon,
        description = ImportGuilds.description,
        preferred_locale = ImportGuilds.preferred_locale
    using ImportGuilds
    where
        ImportGuilds.snowflake = Guilds.snowflake and (
            Guilds.deleted_at is null or
            Guilds.name <> ImportGuilds.name or
            Guilds.icon <> ImportGuilds.icon or
            Guilds.description <> ImportGuilds.description or
            Guilds.preferred_locale <> ImportGuilds.preferred_locale
        );

    -- create new guilds
    insert into Guilds(snowflake, alias, name, icon, description, preferred_locale)
    select
        ImportGuilds.snowflake,
        case
            when g.guild_id is null then ImportGuilds.vanity
            else ImportGuilds.alias
        end as alias,
        ImportGuilds.name,
        ImportGuilds.icon,
        ImportGuilds.description,
        ImportGuilds.preferred_locale
    from Guilds t
        right join InnerGuilds using(snowflake)
        left join Guilds g on ImportGuilds.vanity = g.alias;

    if(replace)
        -- mark old guilds deleted
        update Guilds set
            deleted_at = now()
        where not exists (select 1 from ImportGuilds where ImportGuilds.snowflake = Guilds.snowflake);
    end if;

    return query
        with targets as (delete from ImportGuilds returning snowflake)
        select
            Guilds.*
        from Guilds inner join targets using(snowflake);
end;

create procedure import_members()
begin atomic
    -- update users
    with source as (
        select distinct
            snowflake,
            username,
            discriminator,
            user_avatar
        from ImportGuildMembers
    )
    update Users set
        updated_at = now(),
        username = source.username,
        discriminator = source.discriminator,
        avatar = source.user_avatar,
    using source
    where
        source.snowflake = Users.snowflake and (
            Users.username <> source.username or
            Users.discriminator <> source.discriminator or
            Users.avatar <> source.user_avatar
        );

    -- update members
    update GuildMembers set
        updated_at = now(),
        nickname = ImportGuildMembers.nickname,
        avatar = ImportGuildMembers.guild_avatar
    using ImportGuildMembers inner join Users using(snowflake)
    where
        ImportGuildMembers.guild_id = GuildMembers.guild_id and
        Users.user_id = GuildMembers.user_id and (
            GuildMembers.nickname <> ImportGuildMembers.nickname or
            GuildMembers.avatar <> ImportGuildMembers.guild_avatar
        );

    -- create users
    with source as (
        select distinct (
            snowflake,
            username,
            discriminator,
            user_avatar as avatar
        ) from ImportGuildMembers
    )
    insert into Users (snowflake, username, discriminator, avatar)
    select
        source.snowflake,
        source.username,
        source.discriminator,
        source.avatar
    from Users right join source using(snowflake);

    -- create members
    insert into GuildMembers (user_id, guild_id, nickname, avatar)
    select
        ImportGuildMembers.user_id,
        ImportGuildMembers.guild_id,
        ImportGuildMembers.nickname,
        ImportGuildMembers.avatar
    from GuildMembers inner join Users using(user_id)
        right join ImportGuildMembers using(snowflake);

    -- create new team members

    -- delete old team members

end;

create procedure update_guild_members() language 'plpgsql' as $body$
begin
    -- update existing user objects.
    update Users set
        username = KeepGuildMembers.username,
        discriminator = KeepGuildMembers.discriminator,
        updated_at = now()
    from
        KeepGuildMembers inner join Users source using(snowflake)
    where
        KeepGuildMembers.snowflake = Users.snowflake
        and (
            KeepGuildMembers.username <> Users.username
            or KeepGuildMembers.discriminator <> Users.discriminator
        );

    -- update existing guild members
    update GuildsMembers set
        role = KeepGuildMembers.role,
        nickname = KeepGuildMembers.nickname,
        avatar = KeepGuildMembers.avatar,
        updated_at = now()
    from
        KeepGuildMembers inner join Users using(snowflake)
            inner join GuildMembers source on
                source.guild_id = KeepGuildMembers.guild_id
                and source.user_id = Users.user_id
    where
        source.guild_member_id = GuildMembers.guild_member_id;

    -- create new guild members
    insert into GuildMembers (role, nickname, avatar)
    select
        KeepGuildMembers.role,
        KeepGuildMembers.nickname,
        KeepGuildMembers.avatar
    from
        KeepGuildMembers inner join Users using(snowflake)
            left outer join GuildMembers source on
                source.guild_id = KeepGuildMembers.guild_id
                and source.user_id = Users.user_id
    where
        source.guild_member_id is null;

    -- todo: copy notification data to deleted members table
    -- todo: delete absent guild members
    -- todo: prune user table
end;
$body$;
