import {
    PrismaClient,
    type Boss
} from '../generated/client/index.js'
import { refineExtension } from './extensions/refine.js'

export * from '../generated/client/index.js'
export type DatabaseClient = ReturnType<typeof Database.create>

let instance: DatabaseClient | null = null
export namespace Database {
    export function create(){
        const client = new PrismaClient()
            .$extends(refineExtension)
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

export function triggerIDToBoss(id: number): Boss | null {
    switch(id){
        // Wing 1
        case 15438: return 'ValeGuardian'
        case 15375: return 'Sabetha'
        case 15429: return 'Gorseval'

        // Wing 2
        case 16123: return 'Slothasor'
        case 16088: // Berg
        case 16137: // Zane
        case 16125: // Narella
            return 'BandiTrio'
        case 16115: return 'Matthias'

        // Wing 3
        case 16253: return 'Escort'
        case 16234: return 'KeepConstruct'
        case 16247: return 'TwistedCastle'
        case 16246: return 'Xera'

        // Wing 4
        case 17194: return 'Cairn'
        case 17172: return 'MursaatOverseer'
        case 17188: return 'Samarog'
        case 17154: return 'Deimos'

        // Wing 5
        case 19767: return 'SoullessHorror'
        case 19828: return 'RiverOfSouls'
        case 19691: return 'BrokenKing'
        case 19536: return 'SoulEater'
        case 19651: // Eye of Judgement
        case 19844: // Eye of Fate
            return 'EyeOfJudgmentFate'
        case 19450: return 'Dhuum'

        // Wing 6
        case 43974: return 'ConjuredAmalgamate'
        case 21089: // Kenu
        case 21105: // Nikare
            return 'TwinLargos'
        case 20934: return 'Qadim'

        // Wing 7
        case 21964: return 'Sabir'
        case 22006: return 'Adina'
        case 22000: return 'QadimThePeerless'

        // Strikes
        case 21333: return 'Freezie'
        case 22154: return 'IcebroodConstruct'
        case 22492: return 'FraenirOfJormag'
        case 22343: return 'VoiceClawOfTheFallen'
        case 22521: return 'Boneskinner'
        case 22711: return 'WhisperOfJormag'
        case 22836: return 'ColdWar'

        // EOD Strikes
        case 24033: return 'AetherbladeHideout'
        case 23957: return 'XunlaiJadeJunkyard'
        case 24485: // Minister Li
        case 24266: // Minister Li CM
            return 'KainengOverlook'
        case 43488: return 'HarvestTemple'
        case 25413: // Watchnight Triumvirate
        case 25416: // Arsenite CM
        case 25423: // Indigo CM
        case 25414: // Vermillion CM
            return 'OldLionsCourt'
        default:
            return null // Unrecognized Fight
    }
}
