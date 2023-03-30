create schema if not exists "app";
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
    "snowflake" bigint unique not null,
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
    "snowflake" bigint unique not null,
    "name" text not null,
    "alias" varchar(32) unique not null,
    "lost_remote_reference_at" timestamptz(3)
);

-- CreateTable
create table "guild"."guildmember" (
    "guild_member_id" serial primary key not null,
    "snowflake" bigint not null,
    "guild_id" integer not null references "guild"."guild"("guild_id") on delete cascade,
    "user_id" integer not null references "guild"."user"("user_id") on delete cascade,
    "name" text,
    "icon" text,
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
    "primary_time_zone" text not null default 'America/Los_Angeles', -- default to pacific time, where ANet Headquarters is
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
    "team_id" integer not null references "guild"."team"("team_id") on delete cascade,
    "guild_member_id" integer not null references "guild"."guildmember"("guild_member_id") on delete cascade,
    "role" "guild"."teammemberrole" not null default 'member',
    "source" bigint,
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
