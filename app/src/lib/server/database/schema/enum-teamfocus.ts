import { AppSchema } from "./schema-app"

export enum TeamFocus {
    SquadHot = "squad-hot",
    SquadPof = "squad-pof",
    SquadEod = "squad-eod",
    SquadHtcm = "squad-htcm",
    PartyDungeon = "party-dungeon",
    PartyFractal = "party-fractal",
    PartyDrm = "party-drm",
    PartyPvp = "party-pvp",
    LooseOpenworld = "loose-openworld",
    LooseWvw = "loose-wvw",
}

export const TeamFocuses = AppSchema.Enum("teamfocus", TeamFocus)
