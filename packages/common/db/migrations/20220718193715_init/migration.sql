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

create table Users (
    user_id serial primary key,
    snowflake snowflake unique not null,
    username varchar(32) not null,
    discriminator smallint not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table Profiles (
    profile_id serial primary key,
    user_id integer not null unique references Users(user_id) on delete cascade,
    avatar varchar default null,
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
    alias varchar(32) unique not null,
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
create unique index on Teams (lower(alias));

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
    Users.user_id,
    'embed/avatars/' || (Users.discriminator % 5) || '.png' as avatar
from Users;

create view UserProfileIcons as select
    Users.user_id,
    Profiles.profile_id,
    UserIcons.avatar as default_avatar,
    coalesce(
        'avatars/' || Users.snowflake::text || '/' || Profiles.avatar,
        UserIcons.avatar
    ) as avatar
from Profiles inner join Users using(user_id) inner join UserIcons using(user_id);

create view GuildMemberIcons as select
    Users.user_id,
    Profiles.profile_id,
    GuildMembers.guild_member_id,
    UserIcons.avatar as default_avatar,
    coalesce(
        'guilds/' || Guilds.snowflake::text || '/users/' || Users.snowflake::text || '/avatars/' || GuildMembers.avatar,
        'avatars/' || Users.snowflake::text || '/' || Profiles.avatar,
        UserIcons.avatar
    ) as avatar
from
    GuildMembers inner join Users using(user_id)
    inner join UserIcons using(user_id)
    inner join Guilds using(guild_id)
    left outer join Profiles using(user_id);

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

create view vUserProfiles as select
    Profiles.profile_id,
    Users.user_id,
    Users.snowflake,
    Users.username,
    Users.discriminator,
    Profiles.avatar,
    coalesce(
        'avatars/' || Users.snowflake::text || '/' || Profiles.avatar,
        'embed/avatars/' || (Users.discriminator % 5) || '.png'
    ) as avatar_url_fragment,
    Profiles.updated_at,
    Profiles.created_at
from
    Profiles inner join Users using(user_id);

create view vGuildMember as with initial as (
    select
        Users.user_id,
        GuildMembers.guild_id,
        GuildMembers.guild_member_id,
        Users.snowflake::text as snowflake,
        coalesce(
            'guilds/' || Guilds.snowflake::text || '/users/' || Users.snowflake::text || '/avatars/' || GuildMembers.avatar,
            'avatars/' || Users.snowflake::text || '/' || Profiles.avatar,
            'embed/avatars/' || (Users.discriminator % 5) || '.png'
        ) as avatar_url_fragment,
        coalesce(GuildMembers.nickname, Users.username) as name,
        lpad(Users.discriminator::text, 4, '0') as discriminator,
        GuildMembers.role,
        GuildMembers.deleted_at
    from
        GuildMembers inner join Users using(user_id)
        inner join Guilds using(guild_id)
        left outer join Profiles using(user_id)
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
