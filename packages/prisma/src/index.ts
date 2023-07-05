import {
    PrismaClient,
    type Boss,
    type Prisma,
} from '../generated/client/index.js'
import { refineExtension } from './extensions/refine.js'
import { userExtension } from './extensions/user.js'
import { guildExtension } from './extensions/guild.js'
import { guildMemberExtension } from './extensions/guildMember.js'
import { teamExtension } from './extensions/team.js'
import { teamMemberExtension } from './extensions/teamMember.js'
import { profileExtension } from './extensions/profile.js'
import { authorizationExtension } from './extensions/authorization.js'
import { clientExtension } from './extensions/client.js'
import type { APIUser, User } from '@glenna/discord'

export * from '../generated/client/index.js'
export type DatabaseClient = ReturnType<typeof Database.create>
export type { Authorization, TeamPermissions, DivisionPermissions, GuildPermissions } from './extensions/authorization.js'
export { permissionFragment } from './extensions/authorization.js'

let instance: DatabaseClient | null = null
export namespace Database {
    export function create(){
        const client = new PrismaClient()
            .$extends(clientExtension)
            .$extends(refineExtension)
            .$extends(userExtension)
            .$extends(guildExtension)
            .$extends(guildMemberExtension)
            .$extends(teamExtension)
            .$extends(teamMemberExtension)
            .$extends(profileExtension)
            .$extends(authorizationExtension)
        return client
    }

    export function singleton(){
        return instance ??= create()
    }
}

export function stringifySnowflake<T extends { snowflake: bigint }>({ snowflake, ...props }: T){
    return {
        ...props,
        snowflake: snowflake.toString()
    }
}

const BossTriggerIdMap = new Map<number, Boss>([
    // Wing 1
    [ 15438, 'ValeGuardian' ],
    [ 15375, 'Sabetha' ],
    [ 15429, 'Gorseval' ],

    // Wing 2
    [ 16123, 'Slothasor' ],
    [ 16088, 'BanditTrio' ], // Berg
    [ 16137, 'BanditTrio' ], // Zane
    [ 16125, 'BanditTrio' ], // Narella
    [ 16115, 'Matthias' ],

    // Wing 3
    [ 16253, 'Escort' ],
    [ 16235, 'KeepConstruct' ],
    [ 16247, 'TwistedCastle' ],
    [ 16246, 'Xera' ],

    // Wing 4
    [ 17194, 'Cairn' ],
    [ 17172, 'MursaatOverseer' ],
    [ 17188, 'Samarog' ],
    [ 17154, 'Deimos' ],

    // Wing 5
    [ 19767, 'SoullessHorror' ],
    [ 19828, 'RiverOfSouls' ],
    [ 19691, 'BrokenKing' ],
    [ 19536, 'SoulEater' ],
    [ 19651, 'EyeOfJudgmentFate' ], // Eye of Judgement
    [ 19844, 'EyeOfJudgmentFate' ], // Eye of Fate
    [ 19450, 'Dhuum' ],

    // Wing 6
    [ 43974, 'ConjuredAmalgamate' ],
    [ 21089, 'TwinLargos' ], // Kenut
    [ 21105, 'TwinLargos' ], // Nikare
    [ 20934, 'Qadim' ],

    // Wing 7
    [ 21964, 'Sabir' ],
    [ 22006, 'Adina' ],
    [ 22000, 'QadimThePeerless' ],

    // Strikes
    [ 21333, 'Freezie' ],
    [ 22154, 'IcebroodConstruct' ],
    [ 22492, 'FraenirOfJormag' ],
    [ 22343, 'VoiceClawOfTheFallen' ],
    [ 22521, 'Boneskinner' ],
    [ 22711, 'WhisperOfJormag' ],
    [ 22836, 'ColdWar' ],

    // EOD Strikes
    [ 24033, 'AetherbladeHideout' ],
    [ 23957, 'XunlaiJadeJunkyard' ],
    [ 24485, 'KainengOverlook' ], // Minister Li
    [ 24266, 'KainengOverlook' ], // Minister Li CM
    [ 43488, 'HarvestTemple' ],
    [ 25413, 'OldLionsCourt' ], // Watchnight Triumvirate
    [ 25416, 'OldLionsCourt' ], // Arsenite CM
    [ 25423, 'OldLionsCourt' ], // Indigo CM
    [ 25414, 'OldLionsCourt' ], // Vermillion CM
])

export type TriggerId = number & { __TYPE__: 'TriggerId' }
export function isTriggerId(candidate: number): candidate is TriggerId {
    return BossTriggerIdMap.has(candidate)
}

export function triggerIDToBoss(id: TriggerId): Boss {
    const boss = BossTriggerIdMap.get(id)
    if(!boss)
        throw `Unrecognized Trigger ID ${id}`
    return boss
}

export function safeUsername(user: User | APIUser){
    if(user.discriminator === "0")
        return user.username
    return `${user.username}#${user.discriminator}`
}

export function safeAlias(user: User | APIUser){
    if(user.discriminator === "0")
        return user.username
    return BigInt(user.id).toString(16)
}
