create schema if not exists "app";
create schema if not exists "role";
create schema if not exists "guild";
create schema if not exists "log";

-- Utility Function
create sequence public.GlobalSnowflakeSequence minvalue 0 maxvalue 4095 cycle; -- [0, 2^12)
create function new_snowflake() returns bigint language 'plpgsql' as $body$
declare
    epoch bigint := 1346112000000; -- 8/28/2012 12:00am GMT milliseconds
    shard_mask bigint := ((inet_server_addr() & inet '0.0.3.255') - inet '0.0.0.0') << 12;
begin
    return ((floor((extract(epoch from clock_timestamp()) - epoch) * 1000)::bigint & 2199023255551::bigint) << 22) -- 2^41-1
        | shard_mask
        | nextval('public.GlobalSnowflakeSequence');
end;
$body$;

-- CreateEnum
create type "public"."characterclass" as enum (
    'elementalist',
    'engineer',
    'guardian',
    'mesmer',
    'necromancer',
    'ranger',
    'revenant',
    'thief',
    'warrior'
);

-- CreateEnum
create type "public"."elitespecialization" as enum (
    'core',
    'tempest',
    'scrapper',
    'dragonhunter',
    'chronomancer',
    'reaper',
    'druid',
    'herald',
    'daredevil',
    'berserker',
    'weaver',
    'holosmith',
    'firebrand',
    'mirage',
    'scourge',
    'soulbeast',
    'renegade',
    'deadeye',
    'spellbreaker',
    'catalyst',
    'mechanist',
    'willbender',
    'virtuoso',
    'harbinger',
    'untamed',
    'vindicator',
    'specter',
    'bladesworn'
);

-- CreateEnum
create type "public"."buildcategory" as enum (
    'dps',
    'dpssupport',
    'healsupport',
    'hybridsupport',
    'specialized'
);

-- CreateEnum
create type "public"."builddamagetype" as enum (
    'power',
    'condition',
    'hybrid'
);

-- CreateEnum
create type "public"."buildkeyboon" as enum (
    'alacrity',
    'quickness'
);

-- CreateEnum
create type "log"."logdifficultytype" as enum (
    'normal_mode',
    'challenge_mode',
    'emboldened_mode'
);

-- CreateEnum
create type "log"."boss" as enum (
    'vale_guardian',
    'gorseval',
    'sabetha',
    'slothasor',
    'bandit_trio',
    'matthias',
    'escort',
    'keep_construct',
    'twisted_castle',
    'xera',
    'cairn',
    'mursaat_overseer',
    'samarog',
    'deimos',
    'soulless_horror',
    'river_of_souls',
    'broken_king',
    'soul_eater',
    'eye_of_judgement_fate',
    'dhuum',
    'conjured_amalgamate',
    'twin_largos',
    'qadim',
    'adina',
    'sabir',
    'qadim_the_peerless',
    'freezie',
    'icebrood_construct',
    'fraenir_of_jormag',
    'voice_claw_of_the_fallen',
    'boneskinner',
    'whisper_of_jormag',
    'cold_war',
    'aetherblade_hideout',
    'xunlai_jade_junkyard',
    'kaineng_overlook',
    'harvest_temple',
    'old_lions_court'
);

-- CreateEnum
create type "guild"."teamtype" as enum (
    'normal',
    'management',
    'interest_group',
    'inactive'
);

-- CreateEnum
create type "guild"."teammemberrole" as enum (
    'member',
    'representative',
    'captain'
);

-- CreateEnum
create type "guild"."teammembersource" as enum (
    'synced',
    'manual'
);

-- CreateEnum
create type "guild"."teamfocus" as enum (
    'hot',
    'pof',
    'raid_cm',
    'full_clear',
    'full_clear_cm',
    'eod_cm',
    'harvest_temple_cm',
    'memes',
    'ibs',
    'eod',
    'dungeons',
    'fractals'
);

-- CreateEnum
create type "guild"."teamlevel" as enum (
    'progression',
    'experienced'
);

-- CreateEnum
create type "guild"."teamregion" as enum (
    'north_america',
    'europe',
    'ocx_na',
    'ocx_eu'
);

-- CreateEnum
create type "guild"."teamdaylightsavings" as enum (
    'respect_time',
    'respect_reset'
);

-- CreateTable
create table "guild"."user" (
    "user_id" serial primary key not null,
    "snowflake" bigint unique not null, -- from Discord
    "name" text not null,
    "discriminator" char(4) not null,
    "icon" text
);

-- CreateTable
create table "guild"."account" (
    "account" serial primary key not null,
    "snowflake" bigint unique not null,
    "user_id" integer not null references "guild"."user"("user_id") on delete cascade,
    "name" text unique not null,
    "apiKey" text
);

-- CreateTable
create table "guild"."guild" (
    "guild_id" serial primary key not null,
    "snowflake" bigint unique not null, -- from Discord
    "name" text not null,
    "alias" varchar(32) unique not null,
    "acronym" varchar(8) not null,
    "icon" text,
    "lost_remote_reference_at" timestamptz(3)
);

-- CreateTable
create table "guild"."guildmember" (
    "guild_member_id" serial primary key not null,
    "snowflake" bigint not null, -- from Discord, same as user snowflake
    "guild_id" integer not null references "guild"."guild"("guild_id") on delete cascade,
    "user_id" integer not null references "guild"."user"("user_id") on delete cascade,
    "name" text,
    "icon" text,
    "willing_to_lead" boolean, -- willing to take on a leadership role; null means unanswered.
    "lost_remote_reference_at" timestamptz(3),
    unique("user_id", "guild_id"),
    unique("snowflake", "guild_id")
);

-- CreateTable
create table "guild"."division" (
    "division_id" serial primary key not null,
    "guild_id" integer not null references "guild"."guild"("guild_id") on delete cascade,
    "snowflake" bigint unique not null default new_snowflake(),
    "name" text not null,
    "primary" boolean not null default false
);

-- CreateIndex
create unique index only_one_primary_division_per_guild on "guild"."division"("guild_id")
    where "primary";

-- CreateTable
create table "guild"."team" (
    "team_id" serial primary key not null,
    "snowflake" bigint unique not null default new_snowflake(),
    "guild_id" integer not null references "guild"."guild"("guild_id") on delete cascade,
    "division_id" integer not null references "guild"."division"("division_id") on delete restrict deferrable initially deferred,
    "type" "guild"."teamtype" not null default 'normal',
    "name" text not null,
    "alias" varchar(32) not null,
    "focus" "guild"."teamfocus" not null default 'hot',
    "level" "guild"."teamlevel" not null default 'progression',
    "region" "guild"."teamregion" not null default 'north_america',
    "capacity" smallint default 10,
    "primary_time_zone" text not null default 'America/Detroit', -- default to EST US with DST
    "daylight_savings" "guild"."teamdaylightsavings" default 'respect_reset',
    "role" bigint,
    "channel" bigint,
    "icon" text,

    unique("guild_id", "alias")
);

-- CreateTable
create table "guild"."teamtime" (
    "team_time_id" serial primary key not null,
    "team_id" integer not null references "guild"."team"("team_id") on delete cascade,
    "index" integer not null,
    "time" timestamptz(0) not null,
    "duration" integer not null default 120,

    unique("team_id", "index")
);

-- CreateTable
create table "guild"."teammember" (
    "team_member_id" serial primary key not null,
    "snowflake" bigint unique not null default new_snowflake(),
    "team_id" integer not null references "guild"."team"("team_id") on delete cascade,
    "guild_member_id" integer not null references "guild"."guildmember"("guild_member_id") on delete cascade,
    "role" "guild"."teammemberrole" not null default 'member',
    unique("team_id", "guild_member_id")
);

-- CreateView
create view "guild"."teammembercomputed" as select
    "guild"."teammember"."team_member_id",
    "guild"."guildmember"."name" as "nickname",
    "guild"."user"."name" as "username",
    "guild"."user"."discriminator",
    "guild"."guildmember"."icon" as "member_avatar",
    "guild"."user"."icon" as "user_avatar"
from "guild"."teammember"
    left outer join "guild"."guildmember" using("guild_member_id")
    left outer join "guild"."user" using("user_id");

-- CreateTable
create table "app"."profile" (
    "profile_id" serial primary key not null,
    "snowflake" bigint unique not null,
    "userId" integer unique not null references "guild"."user" on delete cascade
);

-- CreateTable
create table "app"."build" (
    "build_id" serial primary key not null,
    "snowflake" bigint unique not null default new_snowflake(),
    "name" text unique not null,
    "class" "public"."characterclass",
    "specialization" "public"."elitespecialization",
    "tank" boolean default false,
    "category" "public"."buildcategory" not null,
    "damage_type" "public"."builddamagetype",
    "key_boon" "public"."buildkeyboon"
);

-- CreateTable
create table "app"."playerbuild" (
    "player_build_id" serial primary key not null,
    "profile_id" int not null references "app"."profile"("profile_id") on delete cascade,
    "build_id" int not null references "app"."build"("build_id") on delete cascade
);

-- CreateTable
create table "app"."playerexperience" (
    "player_experience_id" serial primary key not null,
    "profile_id" int unique not null references "app"."profile"("profile_id") on delete cascade,
    "total_fields" int not null default 13,
    "completed_fields" int not null default 0,

    "wing1" boolean,
    "wing2" boolean,
    "wing3" boolean,
    "wing4" boolean,
    "wing5" boolean,
    "wing6" boolean,
    "wing7" boolean,

    "ibs_normal_strikes" boolean,

    "eod_normal_strikes" boolean,
    "aetherblade_hideout_cm" boolean,
    "xunlai_jade_junkyard_cm" boolean,
    "kaineng_overlook_cm" boolean,
    "harvest_temple_cm" boolean
);

-- CreateTable
create table "public"."log" (
    "log_id" serial primary key not null,
    "team_id" integer not null references "guild"."team"("team_id") on delete restrict,
    "url" text unique not null,
    "boss" "log"."boss" not null,
    "difficulty" "log"."logdifficultytype" not null,
    "emboldened_level" smallint not null default 0,
    "success" boolean not null,
    "duration" integer not null,
    "start_at" timestamptz(3) not null,
    "submitted_at" timestamptz(3) not null
);

-- CreateTable
create table "log"."log_player" (
    "log_player_id" serial primary key not null,
    "log_id" integer not null references "public"."log"("log_id") on delete cascade,
    "team_member_id" integer references "guild"."teammember"("team_member_id") on delete set null,
    "character" text not null,
    "account" text not null,
    "group" integer not null,
    "class" "public"."characterclass" not null,
    "specialization" "public"."elitespecialization" not null,
    "extendedData" jsonb
);

-- CreateEnum
create type "role"."roletype" as enum (
    'public',
    'superuser',
    'any_guild_member',
    'any_team_member',
    'any_team_representative',
    'any_team_captain',
    'management_member',
    'management_representative',
    'management_captain',
    'team_member',
    'team_representative',
    'team_captain'
);

-- CreateTable
create table "role"."role" (
    "role_id" serial primary key not null,
    "snowflake" bigint unique not null default new_snowflake(),
    "guild_id" int references "guild"."guild"("guild_id") on delete cascade,
    "team_id" int references "guild"."team"("team_id") on delete cascade,
    "type" "role"."roletype" not null,

    unique("guild_id", "team_id", "type")
);
create index on "role"."role"("guild_id") include ("role_id");
create index on "role"."role"("team_id") include ("role_id");
create unique index only_one_public_role on "role"."role"("type") where "type" = 'public';
insert into "role"."role"("type") values ('public'), ('superuser') on conflict do nothing;

create materialized view "role"."publicrole" as
select
    "role_id",
    "snowflake"
from "role"."role" where "type" = 'public'::"role"."roletype";

-- CreateTable
create table "role"."rolechild" (
    "role_child_id" serial primary key not null,
    "parent_id" int not null references "role"."role"("role_id") on delete restrict,
    "child_id" int not null references "role"."role"("role_id") on delete cascade,
    unique("parent_id", "child_id")
);

-- CreateTable
create table "role"."rolemember" (
    "role_member_id" serial primary key not null,
    "user_id" int not null references "guild"."user"("user_id") on delete cascade,
    "role_id" int not null references "role"."role"("role_id") on delete cascade,

    unique("user_id", "role_id")
);
create function "add_user_to_public_role"()
returns trigger language plpgsql as $$
begin
    insert into "role"."rolemember" ("user_id", "role_id") values (
        NEW."user_id",
        (select "role_id" from "role"."publicrole" limit 1)
    );
    return null;
end $$;
create trigger "add_user_to_public_role"
    after insert on "guild"."user"
    for each row execute function "add_user_to_public_role"();

-- CreateTable (Inherited)
create table "role"."guildrolemember" (
    "guild_member_id" int not null references "guild"."guildmember"("guild_member_id") on delete cascade
) inherits ("role"."rolemember");
create function "add_guild_member_to_member_role"()
returns trigger language plpgsql as $$
begin
    insert into "role"."guildrolemember" ("user_id", "guild_member_id", "role_id") values (
        NEW."user_id",
        NEW."guild_member_id",
        (select "any_member_role" from "role"."guildpermission" where "role"."guildpermission"."guild_id" = NEW."guild_id")
    );
    return null;
end $$;
create trigger "add_guild_member_to_member_role"
    after insert on "guild"."guildmember"
    for each row
    execute function "add_guild_member_to_member_role"();

-- CreateTable (Inherited)
create table "role"."teamrolemember" (
    "team_member_id" int not null references "guild"."teammember"("team_member_id") on delete cascade
) inherits ("role"."guildrolemember");
create function "add_team_member_to_member_roles"()
returns trigger language plpgsql as $$
begin
    with
        new_member as (select NEW."team_member_id", NEW."guild_member_id", NEW."team_id", NEW."role"),
        relation_data as (
            select
                "guild"."guildmember"."user_id",
                "guild"."guildmember"."guild_member_id",
                new_member."team_member_id",
                new_member."role",
                "role"."teampermission"."member_role",
                "role"."teampermission"."representative_role",
                "role"."teampermission"."captain_role"
            from new_member
                inner join "guild"."guildmember" using("guild_member_id")
                inner join "role"."teampermission" using("team_id")
        )
    insert into "role"."teamrolemember" ("user_id", "guild_member_id", "team_member_id", "role_id")
    (select
        "user_id",
        "guild_member_id",
        "team_member_id",
        "member_role" as "role_id"
    from relation_data
    union distinct
    select
        "user_id",
        "guild_member_id",
        "team_member_id",
        case
            when relation_data."role" = 'representative'::"guild"."teammemberrole" then relation_data."representative_role"
            when relation_data."role" = 'captain'::"guild"."teammemberrole" then relation_data."captain_role"
            else relation_data."member_role"
        end as "role_id"
    from relation_data);
    return null;
end $$;
create trigger "add_team_member_to_member_roles"
    after insert on "guild"."teammember"
    for each row execute function "add_team_member_to_member_roles"();

create function "update_team_member_roles"()
returns trigger language plpgsql as $$
begin
    with
        new_member as (select NEW."team_member_id", NEW."guild_member_id", NEW."team_id", NEW."role"),
        relation_data as (
            select
                "guild"."guildmember"."user_id",
                "guild"."guildmember"."guild_member_id",
                new_member."team_member_id",
                new_member."role",
                "role"."teampermission"."representative_role",
                "role"."teampermission"."captain_role"
            from new_member
                inner join "guild"."guildmember" using("guild_member_id")
                inner join "role"."teampermission" using("team_id")
        ),
        remove_old as (
            delete from "role"."teamrolemember" as m using relation_data where (
                (relation_data."role" <> 'captain'::"guild"."teammemberrole" and m."role_id" = relation_data."captain_role") or -- delete captain role when not a captain
                (relation_data."role" <> 'representative'::"guild"."teammemberrole" and m."role_id" = relation_data."representative_role") -- delete rep role when not a rep
            ) and relation_data."team_member_id" = m."team_member_id"
        )
    insert into "role"."teamrolemember" ("user_id", "guild_member_id", "team_member_id", "role_id")
    select
        "user_id",
        "guild_member_id",
        "team_member_id",
        case
            when relation_data."role" = 'captain'::"guild"."teammemberrole" then relation_data."captain_role"
            else relation_data."representative_role"
        end as "role_id"
    from relation_data
    where relation_data."role" <> 'member'::"guild"."teammemberrole";
    return null;
end $$;
create trigger "update_team_member_roles"
    after update on "guild"."teammember"
    for each row when (OLD."role" is distinct from NEW."role")
    execute function "update_team_member_roles"();

-- CreateView
create materialized view "role"."rolepairing" as
with recursive "roles" as (
    select
        "role"."role"."role_id",
        "role"."role"."role_id" as "m_id"
    from "role"."role"
    union distinct
    select
        "roles"."role_id",
        "role"."rolechild"."parent_id" as "m_id"
    from "roles" inner join "role"."rolechild" on "roles"."m_id" = "role"."rolechild"."child_id"
)
select
    "roles"."role_id",
    "roles"."m_id"
from "roles";
create index "rolepairing_role_id" on "role"."rolepairing" ("role_id") include ("m_id");

create function "refresh_rolepairing"()
returns trigger language plpgsql as $$
begin
    refresh materialized view "role"."rolepairing";
    return null;
end $$;

create trigger "refresh_rolepairing"
    after insert or update or delete or truncate on "role"."rolechild"
    for each statement execute function "refresh_rolepairing"();

-- CreateView
create view "role"."permissions" as
select
    "role"."rolemember"."role_member_id",
    "role"."rolemember"."user_id",
    "role"."rolepairing"."m_id" as "role_id"
from "role"."rolepairing" inner join "role"."rolemember" using("role_id");

create view "role"."guildmemberpermissions" as
select
    "role"."guildrolemember"."role_member_id",
    "role"."guildrolemember"."user_id",
    "role"."guildrolemember"."guild_member_id",
    "role"."rolepairing"."m_id" as "role_id"
from "role"."rolepairing" inner join "role"."guildrolemember" using("role_id");

create view "role"."teammemberpermissions" as
select
    "role"."teamrolemember"."role_member_id",
    "role"."teamrolemember"."user_id",
    "role"."teamrolemember"."guild_member_id",
    "role"."teamrolemember"."team_member_id",
    "role"."rolepairing"."m_id" as "role_id"
from "role"."rolepairing" inner join "role"."teamrolemember" using("role_id");

-- CreateTable
create table "role"."guildpermission" (
    "guild_permission_id" serial primary key not null,
    "guild_id" integer not null references "guild"."guild"("guild_id") on delete cascade,

    "any_member_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "any_team_member_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "any_team_representative_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "any_team_captain_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "management_member_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "management_representative_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "management_captain_role" int unique not null references "role"."role"("role_id") on delete restrict,

    "update" int not null references "role"."role"("role_id") on delete restrict,
    "read" int not null references "role"."role"("role_id") on delete restrict,

    "create_team" int not null references "role"."role"("role_id") on delete restrict,
    "create_division" int not null references "role"."role"("role_id") on delete restrict
);

-- CreateTable
create table "role"."divisionpermission" (
    "division_permission_id" serial primary key not null,
    "division_id" integer not null references "guild"."division"("division_id"),

    "update" int not null references "role"."role"("role_id") on delete restrict,
    "delete" int references "role"."role"("role_id") on delete restrict,
    "read" int not null references "role"."role"("role_id") on delete restrict
);

-- CreateTable
create table "role"."teampermission" (
    "team_permission_id" serial primary key not null,
    "team_id" integer unique not null references "guild"."team"("team_id") on delete cascade,

    "member_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "representative_role" int unique not null references "role"."role"("role_id") on delete restrict,
    "captain_role" int unique not null references "role"."role"("role_id") on delete restrict,

    "update" int not null references "role"."role"("role_id") on delete restrict,
    "delete" int references "role"."role"("role_id") on delete restrict,
    "read" int not null references "role"."role"("role_id") on delete restrict,

    "update_division" int references "role"."role"("role_id") on delete restrict,
    "update_role" int not null references "role"."role"("role_id") on delete restrict,

    "create_member" int not null references "role"."role"("role_id") on delete restrict,
    "update_member" int not null references "role"."role"("role_id") on delete restrict,
    "delete_member" int not null references "role"."role"("role_id") on delete restrict,
    "read_member" int not null references "role"."role"("role_id") on delete restrict,

    "create_time" int references "role"."role"("role_id") on delete restrict,
    "update_time" int references "role"."role"("role_id") on delete restrict,
    "delete_time" int references "role"."role"("role_id") on delete restrict,
    "read_time" int references "role"."role"("role_id") on delete restrict
);

-- CreateView
create view "guild"."guildstatistics" as
with "unique_team_members" as (
    select
        "guild_id",
        count("guild_member_id") filter (where "type" = 'normal') as "unique_team_members",
        count("guild_member_id") filter (where "type" = 'management') as "unique_management_members",
        count("guild_member_id") filter (where "type" = 'interest_group') as "unique_interest_members"
    from (
        select distinct
            "guild"."guildmember"."guild_id",
            "guild"."team"."type",
            "guild"."guildmember"."guild_member_id"
        from
            "guild"."teammember"
            inner join "guild"."guildmember" using("guild_member_id")
            inner join "guild"."team" using("team_id")
        where
            "guild"."guildmember"."lost_remote_reference_at" is null
    ) as "grouped_data"
    group by
        "guild_id"
)
select distinct
    "guild_id",
    "unique_team_members"."unique_team_members",
    "unique_team_members"."unique_management_members",
    "unique_team_members"."unique_interest_members"
from
    "unique_team_members";
