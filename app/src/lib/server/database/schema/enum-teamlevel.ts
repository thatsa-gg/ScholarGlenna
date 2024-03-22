import { AppSchema } from "./schema-app"

export enum TeamLevel {
    Training = "training",
    Progression = "progression",
    Experienced = "experienced",
    Competitive = "competitive"
}

export const TeamLevels = AppSchema.Enum("teamlevel", TeamLevel)
