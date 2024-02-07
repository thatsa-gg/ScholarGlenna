create schema if not exists "app";
create schema if not exists "discord";
create schema if not exists "game";
create schema if not exists "log";
create schema if not exists "temp";

-- Utility Function
create sequence app.GlobalSnowflakeSequence minvalue 0 maxvalue 4095 cycle; -- [0, 2^12)
create function app.new_snowflake() returns bigint language 'plpgsql' as $body$
declare
    epoch bigint := 1346112000000; -- 8/28/2012 12:00am GMT milliseconds
    shard_mask bigint := ((inet_server_addr() & inet '0.0.3.255') - inet '0.0.0.0') << 12;
begin
    return ((floor((extract(epoch from clock_timestamp()) - epoch) * 1000)::bigint & 2199023255551::bigint) << 22) -- 2^41-1
        | shard_mask
        | nextval('public.GlobalSnowflakeSequence');
end;
$body$;

-- Discord User Table
create table "discord"."user" (
    "user_id" serial primary key not null,
    "discord_id" bigint unique not null,
    "name" varchar(32) unique not null, -- https://discord.com/developers/docs/resources/user#usernames-and-nicknames
    "avatar" text not null
);

-- Profile Table
create table "app"."profile" (
    "profile_id" serial primary key not null,
    "user_id" integer unique not null
        references "discord"."user"("user_id")
        on delete cascade
);

-- Role Hierarchy:
--  public
--  \ any_guild_member
--    \ any_team_member
--      \ any_team_officer
--        \ any_team_owner
--    \ management_member
--      \ team_member (management team)
--        \ team_officer (management team)
--          \ team_owner (management team -- server owner)
--      \ management_officer
--        * team_officer (management team)
--        \ management_owner
--          * team_owner (management team -- server owner)
-- team_* roles for the management team aren't liked to the normal
-- any_team_* hierarchy.
create type "app"."permissionrolekind" as enum (
    'public',
    'administrator',
    'any_guild_member',
    'any_team_member',
    'any_team_officer',
    'any_team_owner',
    'team_member',
    'team_officer',
    'team_owner',
    'management_member',
    'management_officer',
    'management_owner'
);

create table "app"."permissionrole" (
    "permission_role_id" serial primary key not null,
    "kind" "app"."permissionrolekind" not null,
    "guild_id" integer, -- make cleanup easier (fk set up below)
    "team_id" integer, -- make cleanup easier (fk set up below)

    unique("guild_id", "team_id", "kind")
);
create index on "app"."permissionrole"("guild_id") include ("permission_role_id");
create index on "app"."permissionrole"("team_id") include ("permission_role_id");
create unique index only_one_special_role on "app"."permissionrole"("kind")
    where "kind" = 'public' or "kind" = 'administrator';
insert into app.permissionrole(kind) values ('public'), ('administrator');

-- Player Roles (what they can play)
create table "app"."playerrole" (
    "player_role_id" serial primary key not null,
    "profile_id" integer not null references "app"."profile"("profile_id")
        on delete cascade,
    "heal" boolean not null default false,
    "heal_alacrity" boolean not null default false,
    "heal_quickness" boolean not null default false,
    "heal_tank" boolean not null default false,
    "heal_tank_alacrity" boolean not null default false,
    "heal_tank_quickness" boolean not null default false,
    "dps_power" boolean not null default false,
    "dps_power_alacrity" boolean not null default false,
    "dps_power_quickness" boolean not null default false,
    "dps_condition" boolean not null default false,
    "dps_condition_alacrity" boolean not null default false,
    "dps_condition_quickness" boolean not null default false,
    "dps_tank" boolean not null default false,
    "dps_tank_alacrity" boolean not null default false,
    "dps_tank_quickness" boolean not null default false,
    "hand_kite" boolean not null default false,
    "qadim_lamp" boolean not null default false,
    "qadim_kite" boolean not null default false,
    "pylon_kite" boolean not null default false,
    "sh_pusher" boolean not null default false
);

-- Guilds
create type "app"."serverregion" as enum (
    'na',
    'eu',
    'na-eu' -- both
);

create table "app"."guild" (
    "guild_id" serial primary key not null,
    "discord_id" bigint unique not null,
    "last_seen" timestamp not null default now(), -- used to track cleanup

    -- properties
    "name" varchar(128) not null,
    "acronym" varchar(8) not null,
    "icon" text,
    "invite_url" text,
    "description" text,
    "server_region" "app"."serverregion" default null,

    -- lookup
    "vanity_code" varchar(32) unique default null,
    "lookup_alias" varchar(32) unique not null,

    -- permissions
    "permission_read" integer default null references "app"."permissionrole"("permission_role_id"),
    "permission_update" integer default null references "app"."permissionrole"("permission_role_id"),
    "permission_team_create_delete" integer default null references "app"."permissionrole"("permission_role_id"),
    "permission_team_default_update" integer default null references "app"."permissionrole"("permission_role_id"),

    "dummy" int default null -- here for convenience in authoring; TODO: remove this
);
alter table "app"."permissionrole" add constraint fk_app_role_guild_id
    foreign key ("guild_id") references "app"."guild"("guild_id") on delete cascade;

-- for syncing
create table "temp"."guild" (
    "guild_id" integer primary key not null,
    "discord_id" bigint unique not null
);

-- This is only for guild owners and team members
-- "loose" guild members will be retrieved at runtime
-- with the active user's token
create table "discord"."guildmember" (
    "guild_member_id" serial primary key not null,
    "guild_id" integer not null references "app"."guild"("guild_id") on delete cascade,
    "user_id" integer not null references "discord"."user"("user_id") on delete cascade,
    "nickname" varchar(32) default null,
    "avatar" text default null,

    unique("guild_id", "user_id")
);

create table "app"."league" (
    "league_id" serial primary key not null,
    "guild_id" integer not null references "app"."guild"("guild_id"),
    "name" text not null,
    unique("guild_id", "name")
);

create type "app"."teamkind" as enum (
    'management',
    'squad',
    'party',
    'loose'
);

create type "app"."teamfocus" as enum (
    'squad-hot',
    'squad-pof',
    'squad-eod',
    'squad-htcm',
    'party-dungeon',
    'party-fractal',
    'party-drm',
    'party-pvp',
    'loose-openworld',
    'loose-wvw'
);

create type "app"."teamlevel" as enum (
    'training',
    'progression',
    'experienced',
    'competitive'
);

-- Teams
create table "app"."team" (
    "team_id" serial primary key not null,
    "guild_id" integer not null references "app"."guild"("guild_id") on delete cascade,
    "discord_role_id" bigint default null,
    "league_id" integer default null references "app"."league"("league_id") on delete set null,

    -- properties
    "name" varchar(64) not null, -- must be trimmed/match the same rules as discord names
    "kind" "app"."teamkind" not null default 'squad',
    "focus" "app"."teamfocus" array default null,
    "level" "app"."teamlevel" default null,
    "region" "app"."serverregion" default null,

    "applications_open" boolean default null,

    -- permissions
    "permission_read" integer default null references "app"."permissionrole",

    unique("guild_id", "name") -- names must be unique in a guild
);
alter table "app"."permissionrole" add constraint fk_app_role_team_id
    foreign key ("team_id") references "app"."team"("team_id") on delete cascade;

-- Team Members
create table "app"."teammember" (
    "team_member_id" serial primary key not null,
    "team_id" integer not null references "app"."team"("team_id") on delete cascade,
    "guild_member_id" integer not null references "discord"."guildmember"("guild_member_id") on delete cascade,

    unique("team_id", "guild_member_id")
);

-- bit of a note on how this will work:
--    -Profile       -> (none)
--    +Profile -Team -> only user_id linked
--    +Profile +Teeam -> user_id and team_member_id linked
-- Users who aren't on a team won't be stored in the GuildMember table
create table "app"."permissionrolemember" (
    "permission_role_member_id" serial primary key not null,
    "permission_role_id" integer not null references "app"."permissionrole"("permission_role_id") on delete cascade,
    "user_id" integer not null references "discord"."user"("user_id") on delete cascade,
    "team_member_id" integer default null references "app"."teammember"("team_member_id") on delete cascade, -- to make cleaning up team roles easier

    unique(permission_role_id, user_id) -- users can only be a member of a role once
);

-- if a user is a member of a child role, they are also a member of the parent role
create table "app"."permissionrolerolemember" (
    "permission_role_role_member_id" serial primary key not null,
    "parent_permission_role_id" integer not null references "app"."permissionrole"("permission_role_id") on delete cascade,
    "child_permission_role_id" integer not null references "app"."permissionrole"("permission_role_id") on delete cascade,

    unique(parent_permission_role_id, child_permission_role_id) -- roles can only be nested into another role once
);

-- flatten recursive links of roles
create view "app"."permissionroleview" as
with recursive roles as (
    -- all roles link to themselves
    select
        permission_role_id,
        permission_role_id as link_id
    from app.permissionrole
    union distinct
    -- take parent where there is a child
    select
        roles.permission_role_id,
        app.permissionrolerolemember.parent_permission_role_id as link_id
    from roles
        inner join app.permissionrolerolemember on
            roles.link_id =
            app.permissionrolerolemember.child_permission_role_id
)
select
    permission_role_id,
    link_id
from roles;

-- traverse the recursive links of roles, fetch members, and
create view "app"."permissionview" as
select distinct
    app.permissionrolemember.permission_role_member_id,
    app.permissionrolemember.user_id,
    app.permissionroleview.link_id as permission_role_id
from app.permissionroleview
    inner join app.permissionrolemember using(permission_role_id);

create view "app"."guild_readview" as
select
    app.guild.guild_id,
    app.permissionview.user_id,
    app.permissionrole.kind
from app.guild
    inner join app.permissionview on permission_role_id = app.guild.permission_read
    inner join app.permissionrole using(permission_role_id);

create view "app"."guild_updateview" as
select
    app.guild.guild_id,
    app.permissionview.user_id,
    app.permissionrole.kind
from app.guild
    inner join app.permissionview on permission_role_id = app.guild.permission_update
    inner join app.permissionrole using(permission_role_id);

create view "app"."teammember_augmentedview" as
select
    app.teammember.*,
    discord.guildmember.user_id
from app.teammember
    inner join discord.guildmember using(guild_member_id);

create view "app"."team_readview" as
select
    app.team.team_id,
    app.permissionview.user_id,
    app.permissionrole.kind
from app.team
    inner join app.permissionview on permission_role_id = app.team.permission_read
    inner join app.permissionrole using(permission_role_id);

create view "app"."guild_infoview" as
select
    app.guild.guild_id,
    count(distinct app.team.team_id) as teams,
    count(distinct app.league.league_id) as leagues,
    count(distinct app.teammember.guild_member_id) as members
from app.guild
    left outer join app.league using(guild_id)
    left outer join app.team
        on app.team.guild_id = app.guild.guild_id
        and app.team.kind <> 'management'
    left outer join app.teammember using(team_id)
group by app.guild.guild_id;

create view "app"."team_infoview" as
with members as (
    select
        app.team.team_id,
        count(distinct team_member_id) as members
    from app.team
        left outer join app.teammember using(team_id)
    group by app.team.team_id
)
select
    app.team.team_id,
    members.members,
    app.league.name as league_name
from app.team
    inner join members using(team_id)
    left outer join app.league using(league_id);
