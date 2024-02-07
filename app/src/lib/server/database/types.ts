import { sql } from "slonik"

export enum TeamKind {
    Management = 'management',
    Squad = 'squad',
    Party = 'party',
    Loose = 'loose',
}

export namespace TeamKinds {
    export function Fragment(kind: TeamKind){
        return sql.literalValue(kind)
    }

    export const Management = Fragment(TeamKind.Management)
    export const Squad = Fragment(TeamKind.Squad)
    export const Party = Fragment(TeamKind.Party)
    export const Loose = Fragment(TeamKind.Loose)
}

export enum RoleKind {
    Public = "public",
    Administrator = "administrator",
    AnyGuildMember = "any_guild_member",
    AnyTeamMember = "any_team_member",
    AnyTeamOfficer = "any_team_officer",
    AnyTeamOwner = "any_team_owner",
    TeamMember = "team_member",
    TeamOfficer = "team_officer",
    TeamOwner = "team_owner",
    ManagementMember = "management_member",
    ManagementOfficer = "management_officer",
    ManagementOwner = "management_owner",
}

export namespace RoleKinds {
    export function Fragment(kind: RoleKind){
        return sql.literalValue(kind)
    }

    export const Public = Fragment(RoleKind.Public)
    export const Administrator = Fragment(RoleKind.Administrator)
    export const AnyGuildMember = Fragment(RoleKind.AnyGuildMember)
    export const AnyTeamMember = Fragment(RoleKind.AnyTeamMember)
    export const AnyTeamOfficer = Fragment(RoleKind.AnyTeamOfficer)
    export const AnyTeamOwner = Fragment(RoleKind.AnyTeamOwner)
    export const TeamMember = Fragment(RoleKind.TeamMember)
    export const TeamOfficer = Fragment(RoleKind.TeamOfficer)
    export const TeamOwner = Fragment(RoleKind.TeamOwner)
    export const ManagementMember = Fragment(RoleKind.ManagementMember)
    export const ManagementOfficer = Fragment(RoleKind.ManagementOfficer)
    export const ManagementOwner = Fragment(RoleKind.ManagementOwner)
}

export enum ServerRegion {
    NorthAmerica = "na",
    Europe = "eu",
    NorthAmericaAndEurope = "na-eu",
}

export namespace ServerRegions {
    export function Fragment(region: ServerRegion){
        return sql.literalValue(region)
    }

    export const NorthAmerica = Fragment(ServerRegion.NorthAmerica)
    export const Europe = Fragment(ServerRegion.Europe)
    export const NorthAmericaAndEurope = Fragment(ServerRegion.NorthAmericaAndEurope)
}

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

export namespace TeamFocuses {
    export function Fragment(focus: TeamFocus){
        return sql.literalValue(focus)
    }

    // TODO: individuals
    // TODO: friendly name
}

export enum TeamLevel {
    Training = "training",
    Progression = "progression",
    Experienced = "experienced",
    Competitive = "competitive"
}

export namespace TeamLevels {
    export function Fragment(level: TeamLevel){
        return sql.literalValue(level)
    }

    // TODO: individuals
}
