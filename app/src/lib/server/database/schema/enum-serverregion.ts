import { AppSchema } from "./schema-app"

export enum ServerRegion {
    NorthAmerica = "na",
    Europe = "eu",
    Global = "global",
}

export const ServerRegions = AppSchema.Enum("serverregion", ServerRegion)
