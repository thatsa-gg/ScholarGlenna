type DiscordGroup = string & { __TYPE__: "DISCORD_GROUP" }
type DiscordChannel = string & { __TYPE__: "DISCORD_CHANNEL" }
interface User {
    discordId: string
    account: Account[]
    builds: Build[]
}
interface Account {
    name: string
    apiKey: string
}
interface Item {
    updatedAt: Date
    createdAt: Date
    updatedBy: User
    createdBy: User
}
declare enum Profession {
    GUARDIAN,
    WARRIOR,
    REVENANT,
    RANGER,
    THIEF,
    ENGINEER,
    ELEMENTALIST,
    NECROMANCER,
    MESMER,
}
declare enum Specialization {
    CORE,
    DRAGONHUNTER,
    FIREBRAND,
    WILLBENDER,
    BERSERKER,
    SPELLBREAKER,
    BLADESWORN,
    HERALD,
    RENEGADE,
    VINDICATOR,
    DRUID,
    SOULBEAST,
    UNTAMED,
    DAREDEVIL,
    DEADEYE,
    SPECTER,
    SCRAPPER,
    HOLOSMITH,
    MECHANIST,
    TEMPEST,
    WEAVER,
    CATALYST,
    REAPER,
    SCOURGE,
    HARBINGER,
    CHRONOMANCER,
    MIRAGE,
    VIRTUOSO,
}
interface Build extends Item {
    name: string
    profession: Profession
    specialization: Specialization
    capabilities: Capability[]
    requirements: Capability[]
    resources: URL[]
    notes: Note[]
    aliases: string[]
}
declare enum CapabilityType {
    DPS,
    HEAL,
    TANK,
    RESURRECTION,
    BARRIER,
    BANNER,
    SPIRIT,
    POISONS,
    SUPERSPEED,
    SPOTTER,
    ASSASSINS_PRESENCE,
    PINPOINT_DISTRIBUTION,
    EMPOWER_ALLIES,
    STRENGTH_IN_NUMBERS,
    CLEANSE_CONDITIONS,
    BOON_AEGIS,
    BOON_ALACRITY,
    BOON_FURY,
    BOON_MIGHT,
    BOON_PROTECTION,
    BOON_QUICKNESS,
    BOON_REGENERATION,
    BOON_RESISTANCE,
    BOON_RESOLUTION,
    BOON_STABILITY,
    BOON_SWIFTNESS,
    BOON_VIGOR,
    CONDI_BLEEDING,
    CONDI_BURNING,
    CONDI_CONFUSION,
    CONDI_POISON,
    CONDI_TORMENT,
    CONDI_BLIND,
    CONDI_CHILL,
    CONDI_CRIPPLE,
    CONDI_FEAR,
    CONDI_IMMOBILIZE,
    CONDI_SLOW,
    CONDI_TAUNT,
    CONDI_WEAKNESS,
    CONDI_VULNERABILITY,
}
interface Capability {
    type: CapabilityType
    ability: number
}
interface Note extends Item {
    content: string
}
interface Team extends Item {
    name: string
    channel: DiscordChannel
    times: Occurrence[]
    member: User[]
}
interface TeamRole extends Item {
    user: User
    team: Team
    role: 'Leader' | 'Commander' | 'Member' | 'Observer'
}
interface Occurrence {
    frequency: 'weekly' | 'monthly' | 'single'
    time: Date
}
interface Permissions {
    role: 'Mentor' | 'Moderator'
    group: DiscordGroup
}
