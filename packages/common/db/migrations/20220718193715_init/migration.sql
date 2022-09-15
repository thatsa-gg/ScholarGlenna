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

create function get_current_request_id() returns snowflake
begin atomic
    return coalesce(cast(nullif(current_setting('public.log_request_id', true), '') as bigint), new_snowflake());
end;

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
    alias varchar(32) not null,
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

create type Visibility as enum (
    'Public',    -- always visible
    'Protected', -- only visible if in the same group
    'Members'    -- always private (basic team info may still be available in some groups)
);

create table Teams (
    team_id serial primary key,
    guild_id integer not null references Guilds(guild_id) on delete cascade,
    snowflake snowflake unique not null,
    alias varchar(32) not null,
    name text not null,
    description text,
    role snowflake unique default null,
    visibility Visibility not null default 'Protected',
    channel snowflake default null,
    color integer default null, -- from role
    icon varchar default null, -- from role
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone default null
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

create table TeamMembers (
    member_id serial primary key,
    team_id integer not null references Teams(team_id) on delete cascade,
    guild_member_id integer not null references GuildMembers(guild_member_id) on delete cascade,
    role TeamMemberRole not null default 'Member',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    unique(team_id, guild_member_id)
);

create view TeamMemberships as select
    TeamMembers.team_id,
    GuildMembers.user_id
from TeamMembers inner join GuildMembers using(guild_member_id);

-- This is a count of all users that either have a role, a profile, or are active members of a team.
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
    union all select
        GuildMembers.guild_member_id,
        GuildMembers.user_id,
        1 as weight
    from GuildMembers inner join Profiles using(user_id)
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
    UserIcons.user_id,
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
        Users.snowflake as user_snowflake,
        Users.snowflake::text as snowflake,
        GuildMemberIcons.avatar as avatar_url_fragment,
        coalesce(GuildMembers.nickname, Users.username) as name,
        lpad(Users.discriminator::text, 4, '0') as discriminator,
        GuildMembers.role,
        GuildMembers.deleted_at
    from
        GuildMembers
        inner join Users using(user_id)
        inner join GuildMemberIcons using(guild_member_id)
)
select
    user_id,
    guild_id,
    guild_member_id,
    user_snowflake,
    snowflake,
    avatar_url_fragment,
    name,
    discriminator,
    concat(name, '#', discriminator) as display_name,
    role,
    deleted_at
from initial;

-------------------------------------------------------------------------------

create type HistoryEvent as enum (
    'UserCreate',
    'UserNameChange',
    'UserDelete',
    'GuildCreate',
    'GuildEdit',
    'GuildDelete',
    'GuildRestore',
    'GuildPurge',
    'GuildMemberJoin',
    'GuildMemberLeave',
    'GuildMemberDelete',
    'TeamCreate',
    'TeamEdit',
    'TeamDelete',
    'TeamPurge',
    'TeamMemberAdd',
    'TeamMemberRemove',
    'TeamMemberLeave',
    'TeamMemberEdit'
);
create table History (
    log_id bigserial primary key,
    correlation_id snowflake not null default new_snowflake(),
    created_at timestamp with time zone not null default now(),
    event_type HistoryEvent not null,
    actor_snowflake snowflake default null,
    actor_name text not null,
    user_snowflake snowflake default null,
    user_name text default null,
    guild_snowflake snowflake default null,
    guild_name text default null,
    team_id int default null references Teams(team_id) on delete set null,
    team_name text default null,
    data jsonb default null
);
create index on History(correlation_id);
create index on History(actor_snowflake);
create index on History(user_snowflake);
create index on History(guild_snowflake);
create index on History(team_id);

-------------------------------------------------------------------------------
---                                                                         ---
---                 Import Tables                                           ---
---                                                                         ---
--- These should be empty outside of transactions.                          ---
-------------------------------------------------------------------------------

create unlogged table ImportGuilds (
    guild_snowflake snowflake primary key,
    vanity varchar(32),
    alias varchar not null,
    name text not null,
    icon varchar,
    description text,
    preferred_locale varchar(5) not null
);

create unlogged table ImportGuildMembers (
    user_snowflake snowflake not null,
    guild_id integer not null references Guilds(guild_id),
    username varchar(32) not null,
    discriminator smallint not null,
    nickname text,
    user_avatar varchar,
    guild_avatar varchar,
    role GuildRole,
    primary key(user_snowflake, guild_id)
);

create unlogged table ImportTeamMembers (
    user_snowflake snowflake not null,
    team_id integer not null references Teams(team_id),
    unique(user_snowflake, team_id)
);

-------------------------------------------------------------------------------
---                                                                         ---
---                 Procedures and Functions                                ---
---                                                                         ---
-------------------------------------------------------------------------------

create function import_guilds(correlation_id snowflake, replace boolean) returns setof Guilds
begin atomic
    -- update guilds
    with updated_guilds as (
        update Guilds set
            updated_at = now(),
            name = ImportGuilds.name,
            icon = ImportGuilds.icon,
            description = ImportGuilds.description,
            preferred_locale = ImportGuilds.preferred_locale
        from ImportGuilds
        where
            Importguilds.guild_snowflake = Guilds.snowflake and
            Guilds.deleted_at is not null and (
                Guilds.name <> ImportGuilds.name or
                Guilds.icon <> ImportGuilds.icon or
                Guilds.description <> ImportGuilds.description or
                Guilds.preferred_locale <> ImportGuilds.preferred_locale
            )
        returning Guilds.*
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name, data)
    select
        correlation_id,
        'GuildEdit' as event_type,
        'ScholarGlenna' as actor_name,
        snowflake,
        name as guild_name,
        jsonb_build_object(
            'icon', icon,
            'description', description,
            'preferred_locale', preferred_locale
        ) as data
    from updated_guilds;

    -- restore guilds
    with restored_guilds as (
        update Guilds set
            deleted_at = null,
            updated_at = now(),
            name = ImportGuilds.name,
            icon = ImportGuilds.icon,
            description = ImportGuilds.description,
            preferred_locale = ImportGuilds.preferred_locale
        from ImportGuilds
        where
            Importguilds.guild_snowflake = Guilds.snowflake and
            Guilds.deleted_at is null and (
                Guilds.name <> ImportGuilds.name or
                Guilds.icon <> ImportGuilds.icon or
                Guilds.description <> ImportGuilds.description or
                Guilds.preferred_locale <> ImportGuilds.preferred_locale
            )
        returning Guilds.*
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name, data)
    select
        correlation_id,
        'GuildRestore' as event_type,
        'ScholarGlenna' as actor_name,
        snowflake,
        name as guild_name,
        jsonb_build_object(
            'icon', icon,
            'description', description,
            'preferred_locale', preferred_locale
        ) as data
    from restored_guilds;

    -- create new guilds
    with new_guilds as (
        insert into Guilds(snowflake, alias, name, icon, description, preferred_locale)
        select
            ImportGuilds.guild_snowflake,
            coalesce(case
                when g.guild_id is null then ImportGuilds.vanity
                else null
            end, ImportGuilds.alias) as alias,
            ImportGuilds.name,
            ImportGuilds.icon,
            ImportGuilds.description,
            ImportGuilds.preferred_locale
        from ImportGuilds
            left outer join Guilds g on ImportGuilds.vanity = g.alias
        where not exists (select 1 from Guilds where Guilds.snowflake = ImportGuilds.guild_snowflake)
        returning *
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name, data)
    select
        correlation_id,
        'GuildCreate' as event_type,
        'ScholarGlenna' as actor_name,
        snowflake,
        name as guild_name,
        jsonb_build_object(
            'icon', icon,
            'description', description,
            'preferred_locale', preferred_locale
        ) as data
    from new_guilds;

    -- mark old guilds deleted
    with marked_guilds as (
        update Guilds set
            deleted_at = now()
        where
            not exists (select 1 from ImportGuilds where ImportGuilds.guild_snowflake = Guilds.snowflake)
            and replace
        returning *
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name)
    select
        correlation_id,
        'GuildDelete' as event_type,
        'ScholarGlenna' as actor_name,
        snowflake,
        name as guild_name
    from marked_guilds;

    -- prune will be handled by on commit delete rows trigger for ImportGuilds.
    select
        Guilds.*
    from Guilds
        inner join ImportGuilds on Guilds.snowflake = ImportGuilds.guild_snowflake;
end;

create procedure import_member_dependencies(correlation_id snowflake)
begin atomic
-- update users
    with source as (
        select distinct
            user_snowflake as snowflake,
            username,
            discriminator,
            user_avatar
        from ImportGuildMembers
    )
    update Users set
        updated_at = now(),
        username = source.username,
        discriminator = source.discriminator,
        avatar = source.user_avatar
    from source
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
    from ImportGuildMembers
        inner join Users on ImportGuildMembers.user_snowflake = Users.snowflake
    where
        GuildMembers.user_id = Users.user_id and
        GuildMembers.guild_id = ImportGuildMembers.guild_id and (
            GuildMembers.nickname <> ImportGuildMembers.nickname or
            GuildMembers.avatar <> ImportGuildMembers.guild_avatar
        );

    -- create users
    with source as (
        select distinct
            user_snowflake as snowflake,
            username,
            discriminator,
            user_avatar as avatar
        from ImportGuildMembers
    ), new_users as (
        insert into Users (snowflake, username, discriminator, avatar)
        select
            source.snowflake,
            source.username,
            source.discriminator,
            source.avatar
        from
            source
        where
            not exists (select 1 from Users where Users.snowflake = source.snowflake)
        returning Users.*
    )
    insert into History(correlation_id, event_type, actor_name, user_snowflake, user_name)
    select
        correlation_id,
        'UserCreate',
        'ScholarGlenna',
        snowflake,
        username || '#' || lpad(discriminator::text, 4, '0')
    from new_users;

    -- create members
    with new_members as (
        insert into GuildMembers (user_id, guild_id, nickname, avatar, role)
        select
            Users.user_id,
            ImportGuildMembers.guild_id,
            ImportGuildMembers.nickname,
            ImportGuildMembers.guild_avatar,
            ImportGuildMembers.role
        from ImportGuildMembers
            inner join Users on ImportGuildMembers.user_snowflake = Users.snowflake
        where not exists (
            select 1 from GuildMembers where
                GuildMembers.guild_id = ImportGuildMembers.guild_id and
                GuildMembers.user_id = Users.user_id
        )
        returning *
    )
    insert into History(correlation_id, event_type, actor_name, user_snowflake, user_name, guild_snowflake, guild_name)
    select
        correlation_id,
        'GuildMemberJoin',
        'ScholarGlenna',
        Users.snowflake,
        coalesce(new_members.nickname, Users.username) || '#' || lpad(Users.discriminator::text, 4, '0') as display_name,
        Guilds.snowflake,
        Guilds.name
    from new_members
        inner join Guilds using(guild_id)
        inner join Users using(user_id);
end;

create procedure create_new_team_members(correlation_id snowflake)
begin atomic
    -- create new team members
    with new_members as (
        insert into TeamMembers (team_id, guild_member_id)
        select
            ImportTeamMembers.team_id,
            GuildMembers.guild_member_id
        from ImportTeamMembers
            inner join Users on Users.snowflake = ImportTeamMembers.user_snowflake
            inner join Teams on Teams.team_id = ImportTeamMembers.team_id
            inner join GuildMembers on
                GuildMembers.guild_id = Teams.guild_id and
                GuildMembers.user_id = Users.user_id
        where not exists (
            select 1 from TeamMembers
                inner join GuildMembers using(guild_member_id)
                inner join Users using(user_id)
                inner join ImportTeamMembers on
                    ImportTeamMembers.user_snowflake = Users.snowflake and
                    ImportTeamMembers.team_id = TeamMembers.team_id
        )
        returning team_id, guild_member_id
    )
    insert into History(correlation_id, event_type, actor_name, user_snowflake, user_name, guild_snowflake, guild_name, team_id, team_name)
    select
        correlation_id,
        'TeamMemberAdd',
        'ScholarGlenna',
        vGuildMember.user_snowflake,
        vGuildMember.display_name,
        Guilds.snowflake,
        Guilds.name,
        Teams.team_id,
        Teams.name
    from new_members
        inner join vGuildMember using(guild_member_id)
        inner join Guilds using(guild_id)
        inner join Teams using(team_id);
end;

create procedure prune_guild_members_and_users(correlation_id snowflake)
begin atomic
    -- prune guild members
    with removed_members as (
        delete from GuildMembers
        using Guilds
        where not exists (
            select 1 from ImportGuildMembers
                inner join Users on Users.snowflake = ImportGuildMembers.user_snowflake
            where
                ImportGuildMembers.guild_id = GuildMembers.guild_id and
                Users.user_id = GuildMembers.user_id
        ) and GuildMembers.guild_id = Guilds.guild_id and Guilds.deleted_at is not null
        returning GuildMembers.guild_id, GuildMembers.user_id
    )
    insert into History (correlation_id, event_type, actor_name, user_snowflake, user_name, guild_snowflake, guild_name)
    select
        correlation_id,
        'GuildMemberLeave',
        'ScholarGlenna',
        Users.snowflake,
        Users.username || '#' || lpad(Users.discriminator::text, 4, '0') as user_name,
        Guilds.snowflake,
        Guilds.name
    from removed_members
        inner join Users using(user_id)
        inner join Guilds using(guild_id);

    -- prune users
    with removed_users as (
        delete from Users using UserReferenceCount where
            Users.user_id = UserReferenceCount.user_id and
            UserReferenceCount.Count = 0
        returning snowflake, username, discriminator
    )
    insert into History (correlation_id, event_type, actor_name, user_snowflake, user_name)
    select
        correlation_id,
        'UserDelete',
        'ScholarGlenna',
        snowflake,
        username || '#' || lpad(discriminator::text, 4, '0') as user_name
    from removed_users;
end;

create procedure sync_members(correlation_id snowflake, sync_team_id int) as $$
begin
    call import_member_dependencies(correlation_id);
    call create_new_team_members(correlation_id);

    with removed_members as (
        delete from TeamMembers where not exists (
            select 1 from ImportTeamMembers
                inner join Users on Users.snowflake = ImportTeamMembers.user_snowflake
                inner join GuildMembers using(user_id)
                inner join Teams using(team_id)
            where
                TeamMembers.team_id = ImportTeamMembers.team_id and
                TeamMembers.guild_member_id = GuildMembers.guild_member_id and
                Teams.role is not null
        ) and TeamMembers.team_id = sync_team_id
        returning team_id, guild_member_id
    )
    insert into History (correlation_id, event_type, actor_name, user_snowflake, user_name, guild_snowflake, guild_name, team_id, team_name)
    select
        correlation_id,
        case
            when ImportGuildMembers.user_snowflake is null then 'TeamMemberLeave'::HistoryEvent
            else 'TeamMemberRemove'::HistoryEvent
        end::HistoryEvent as event_type,
        'ScholarGlenna',
        vGuildMember.user_snowflake,
        vGuildMember.display_name,
        Guilds.snowflake,
        Guilds.name,
        Teams.team_id,
        Teams.name
    from removed_members
        inner join Teams using(team_id)
        inner join vGuildMember using(guild_member_id) -- old guild members not yet removed
        inner join Users using(user_id)
        inner join Guilds on Teams.guild_id = Guilds.guild_id
        left outer join ImportGuildMembers on
            Guilds.guild_id = ImportGuildMembers.guild_id and
            Users.snowflake = ImportGuildMembers.user_snowflake;

    call prune_guild_members_and_users(correlation_id);
end $$ language plpgsql;

create procedure import_members(correlation_id snowflake) as $$
begin
    call import_member_dependencies(correlation_id);
    call create_new_team_members(correlation_id);

    -- remove team members
    with removed_members as (
        delete from TeamMembers where not exists (
            select 1 from ImportTeamMembers
                inner join Users on Users.snowflake = ImportTeamMembers.user_snowflake
                inner join GuildMembers using(user_id)
                inner join Teams using(team_id)
            where
                TeamMembers.team_id = ImportTeamMembers.team_id and
                TeamMembers.guild_member_id = GuildMembers.guild_member_id and
                Teams.role is not null
        ) returning team_id, guild_member_id
    )
    insert into History (correlation_id, event_type, actor_name, user_snowflake, user_name, guild_snowflake, guild_name, team_id, team_name)
    select
        correlation_id,
        case
            when ImportGuildMembers.user_snowflake is null then 'TeamMemberLeave'::HistoryEvent
            else 'TeamMemberRemove'::HistoryEvent
        end::HistoryEvent as event_type,
        'ScholarGlenna',
        vGuildMember.user_snowflake,
        vGuildMember.display_name,
        Guilds.snowflake,
        Guilds.name,
        Teams.team_id,
        Teams.name
    from removed_members
        inner join Teams using(team_id)
        inner join vGuildMember using(guild_member_id) -- old guild members not yet removed
        inner join Users using(user_id)
        inner join Guilds on Teams.guild_id = Guilds.guild_id
        left outer join ImportGuildMembers on
            Guilds.guild_id = ImportGuildMembers.guild_id and
            Users.snowflake = ImportGuildMembers.user_snowflake;

    call prune_guild_members_and_users(correlation_id);
end $$ language plpgsql;

create procedure cleanup_import() as $$
begin
    truncate ImportTeamMembers;
    truncate ImportGuildMembers;
    truncate ImportGuilds;
end; $$ language plpgsql;

create procedure prune_guild_members(correlation_id snowflake) as $$
begin
    -- prune guild members
    with removed_members as (
        delete from
            GuildMembers
        using
            GuildMemberReferenceCount
        where
            GuildMembers.guild_member_id = GuildMemberReferenceCount.guild_member_id
            and GuildMemberReferenceCount.Count = 0
        returning GuildMembers.guild_id, GuildMembers.user_id
    )
    insert into History (correlation_id, event_type, actor_name, user_snowflake, user_name, guild_snowflake, guild_name)
    select
        correlation_id,
        'GuildMemberDelete',
        'ScholarGlenna',
        Users.snowflake,
        Users.username || '#' || lpad(Users.discriminator::text, 4, '0') as user_name,
        Guilds.snowflake,
        Guilds.name
    from removed_members
        inner join Users using(user_id)
        inner join Guilds using(guild_id);

    -- prune users
    with removed_users as (
        delete from Users using UserReferenceCount where
            Users.user_id = UserReferenceCount.user_id and
            UserReferenceCount.Count = 0
        returning snowflake, username, discriminator
    )
    insert into History (correlation_id, event_type, actor_name, user_snowflake, user_name)
    select
        correlation_id,
        'UserDelete',
        'ScholarGlenna',
        snowflake,
        username || '#' || lpad(discriminator::text, 4, '0') as user_name
    from removed_users;
end; $$ language plpgsql;

create procedure remove_team_channel(channel_id snowflake, correlation_id snowflake) as $$
begin
    with affected as (
        update Teams set
            channel = null,
            updated_at = now()
        where
            channel = channel_id
        returning team_id, name, guild_id
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name, team_id, team_name, data)
    select
        correlation_id,
        'TeamEdit',
        'ScholarGlenna',
        Guilds.snowflake,
        Guilds.name,
        affected.team_id,
        affected.name,
        jsonb_build_array(
            jsonb_build_object(
                'field', 'channel',
                'old', channel_id::text,
                'new', null
            )
        ) as data
    from
        affected inner join Guilds using(guild_id);
end; $$ language plpgsql;

create procedure remove_team_role(role_id snowflake, correlation_id snowflake) as $$
begin
    with affected as (
        update Teams set
            role = null,
            color = null,
            icon = null,
            updated_at = now()
        where
            role = role_id
        returning team_id, name, guild_id
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name, team_id, team_name, data)
    select
        correlation_id,
        'TeamEdit',
        'ScholarGlenna',
        Guilds.snowflake,
        Guilds.name,
        affected.team_id,
        affected.name,
        jsonb_build_array(
            jsonb_build_object(
                'field', 'role',
                'old', role_id::text,
                'new', null
            )
        ) as data
    from
        affected inner join Guilds using(guild_id);
end; $$ language plpgsql;

create procedure update_team_role(channel_id snowflake, correlation_id snowflake) as $$
begin
    with affected as (
        update Teams set
            channel = null,
            updated_at = now()
        where
            channel = channel_id
        returning team_id, name, guild_id
    )
    insert into History(correlation_id, event_type, actor_name, guild_snowflake, guild_name, team_id, team_name, data)
    select
        correlation_id,
        'TeamEdit',
        'ScholarGlenna',
        Guilds.snowflake,
        Guilds.name,
        affected.team_id,
        affected.name,
        jsonb_build_array(
            jsonb_build_object(
                'field', 'channel',
                'old', channel_id::text,
                'new', null
            )
        ) as data
    from
        affected inner join Guilds using(guild_id);
end; $$ language plpgsql;
