import { record, z } from "zod"
import { sql, type IdentifierSqlToken, type SqlFragment } from "slonik"
import { TeamKind, RoleKind, ServerRegion as GuildServerRegion, RoleKinds, TeamKinds, ServerRegions, TeamFocus, TeamLevel } from "./types"
import type { APIGuild, APIUser } from "discord-api-types/v10"
import { Database } from "./raw"

type CamelCase<S extends string> = S extends `${infer prefix}_${infer lead}${infer suffix}`
    ? `${Lowercase<prefix>}${Capitalize<Lowercase<lead>>}${CamelCase<suffix>}`
    : S

function camelCase<S extends string>(str: S): CamelCase<S> {
    return str.toLowerCase().replace(/_(.)/g, (_, a) => a.toUpperCase()) as CamelCase<S>
}

type TableIdentifier = IdentifierSqlToken & { __GLENNA_TYPE__: "TableIdentifier" }
function table(schema: string, name: string): TableIdentifier {
    return sql.identifier([ schema, name ]) as TableIdentifier
}

type ViewIdentifier = IdentifierSqlToken & { __GLENNA_TYPE__: "ViewIdentifier" }
function view(schema: string, name: string): ViewIdentifier {
    return sql.identifier([ schema, name ]) as ViewIdentifier
}

export class Column<T extends z.ZodTypeAny, TProperty extends string, TColumn extends string> {
    Type: T;
    PropertyName: TProperty;
    RawColumnName: TColumn;
    Column: IdentifierSqlToken;
    Set: { [key in TProperty]: Column<T, TProperty, TColumn> }
    Table;
    constructor(
        table: TableIdentifier | ViewIdentifier | null,
        column: TColumn,
        property: TProperty,
        type: T
    ){
        this.Table = table;
        this.Type = type
        this.RawColumnName = column
        this.Column = sql.identifier([ ...table?.names ?? [], column ])
        this.PropertyName = property
        this.Set = { [property]: this } as unknown as { [key in TProperty]: Column<T, TProperty, TColumn> }
    }

    Select(alias: string = this.PropertyName){
        return sql.fragment`${this.Column} as ${sql.identifier([alias])}`
    }

    Insert(){
        return sql.identifier([ this.RawColumnName ])
    }

    Excluded(){
        return sql.identifier([ "excluded", this.RawColumnName ])
    }

    Returning(alias: null | string = this.PropertyName){
        return sql.fragment`${sql.identifier([this.RawColumnName])} as ${sql.identifier([ alias ?? this.RawColumnName])}`
    }

    Rename<P extends string>(name: P): Column<T, P, TColumn> {
        return new Column(this.Table, this.RawColumnName, name, this.Type)
    }

    InView(identifier: ViewIdentifier): Column<T, TProperty, TColumn>
    InView<U extends z.ZodTypeAny>(identifier: ViewIdentifier, typeFn: (type: T) => U): Column<U, TProperty, TColumn>
    InView<U extends z.ZodTypeAny>(identifier: ViewIdentifier, typeFn?: (type: T) => U){
        return new Column(identifier, this.RawColumnName, this.PropertyName,
            typeFn?.(this.Type) ?? this.Type);
    }

    ForeignKey(table: TableIdentifier): Column<T, TProperty, TColumn>
    ForeignKey<U extends z.ZodTypeAny>(table: TableIdentifier, typeFn: (type: T) => U): Column<U, TProperty, TColumn>
    ForeignKey<U extends z.ZodTypeAny>(table: TableIdentifier, typeFn?: (type: T) => U){
        return new Column(table, this.RawColumnName, this.PropertyName,
            typeFn?.(this.Type) ?? this.Type)
    }

    ForeignKeyAs<C extends string, P extends string>(table: TableIdentifier, column: C, property: P): Column<T, P, C>
    ForeignKeyAs<U extends z.ZodTypeAny, C extends string, P extends string>(
        table: TableIdentifier, column: C, property: P, typeFn: (type: T) => U): Column<U, P, C>
    ForeignKeyAs<U extends z.ZodTypeAny, C extends string, P extends string>(
        table: TableIdentifier,
        column: C,
        property: P,
        typeFn?: (type: T) => U
    ){
        return new Column(table, column, property, typeFn?.(this.Type) ?? this.Type)
    }
}

type SqlColumnMap<M extends Record<string, Column<z.ZodTypeAny, string, string>>> =
    { [Key in keyof M]: z.infer<M[Key]['Type']> | SqlFragment }
export type AllColumns<M extends ColumnSet<Record<string, Column<z.ZodTypeAny, string, string>>>> =
    SqlColumnMap<M['Map']>
export type PickColumns<M extends ColumnSet<Record<string, Column<z.ZodTypeAny, string, string>>>, K extends keyof M['Map']> =
    Pick<SqlColumnMap<M['Map']>, K>
export class ColumnSet<M extends Record<string, Column<z.ZodTypeAny, string, string>>> {
    Type;
    Map: M;
    Columns: Array<keyof M>;
    constructor(map: M){
        this.Map = map;
        this.Columns = Object.keys(map) as Array<keyof M>;
        this.Type = z.object(
            Object.fromEntries(
                Object.entries(map).map(
                    ([ key, value ]) => [ key, value.Type ]
                )
            ) as { [key in keyof typeof map]: typeof map[key]['Type'] }
        )
    }

    Select(){
        return sql.join(
            Object.values(this.Map)
                  .map(column => column.Select()),
            sql.fragment`, `
        )
    }

    Update<Keys extends keyof M>(properties: Pick<SqlColumnMap<M>, Keys>){
        const fragments = Object.entries(properties)
            .filter(pair => pair[1] !== undefined)
            .map(pair => sql.fragment`${this.Map[pair[0] as keyof M].Insert()} = ${pair[1] as any}`)
        if(0 === fragments.length)
            return null
        return sql.join(fragments, sql.fragment`, `)
    }

    Insert<Keys extends keyof M>(...properties: Keys[]){
        return sql.join(properties.map(property => this.Map[property].Insert()), sql.fragment`, `)
    }

    Extend<N extends Record<string, Column<z.ZodTypeAny, string, string>>>(columns: N): ColumnSet<M & N> {
        return new ColumnSet({ ...this.Map, ...columns })
    }
}

export namespace Column {
    export function Boolean<P extends string>(name: P): Column<z.ZodBoolean, P, P> {
        return new Column(null, name, name, z.boolean())
    }

    export type RoleColumnType = z.ZodNullable<typeof IdColumns.RoleId['Type']>
    export function Permission<C extends string>(table: TableIdentifier, column: C): Column<RoleColumnType, CamelCase<C>, C>
    export function Permission<C extends string, P extends string>(table: TableIdentifier, column: C, property: P): Column<RoleColumnType, P, C>
    export function Permission<C extends string, P extends string>(table: TableIdentifier, column: C, property?: P){
        return IdColumns.RoleId.ForeignKeyAs(table, column, property ?? camelCase(column), Nullable)
    }
}

namespace Tables {
    export const User = table("discord", "user")
    export const Guild = table("app", "guild")
    export const GuildMember = table("discord", "guildmember")
    export const Role = table("app", "permissionrole")
    export const RoleMember = table("app", "permissionrolemember")
    export const Team = table("app", "team")
    export const TeamMember = table("app", "teammember")
    export const Profile = table("app", "profile")
    export const TempGuild = table("temp", "guild")
    export const League = table("app", "league")
}

namespace IdColumns {
    const Int = z.number().int()
    export const GuildId = new Column(Tables.Guild, "guild_id", "guildId", Int)
    export const RoleId = new Column(Tables.Role, "role_id", "roleId", Int)
    export const UserId = new Column(Tables.User, "user_id", "userId", Int)
    export const TeamId = new Column(Tables.Team, "team_id", "teamId", Int)
    export const TeamMemberId = new Column(Tables.TeamMember, "team_member_id", "teamMemberId", Int)
    export const ProfileId = new Column(Tables.Profile, "profile_id", "profileId", Int)
    export const GuildMemberId = new Column(Tables.GuildMember, "guild_member_id", "guildMemberId", Int)
    export const LeagueId = new Column(Tables.League, "league_id", "leagueId", Int)
}

const Nullable = <U extends z.ZodTypeAny>(type: U) => type.nullable()
class PermissionView<C extends string, T extends Column<Column.RoleColumnType, string, C>> {
    View
    LinkId
    Kind
    UserId
    JoinViewToBaseTable

    constructor(idColumn: Column<typeof IdColumns['GuildId']['Type'], string, string>, column: T){
        const [ schema, table ] = column.Table!.names
        const part = column.RawColumnName.replace(/^permission_|_/g, "")
        this.View = view(schema, `${table}_${part}view`)
        this.Kind = RoleTable.Kind.InView(this.View)
        this.UserId = IdColumns.UserId.InView(this.View)
        this.LinkId = idColumn.InView(this.View)

        this.JoinViewToBaseTable = sql.fragment`${this.View} on ${idColumn.Column} = ${this.LinkId.Column}`
    }

    HasPermission(user: Nullable<Glenna.Id.User>){
        const userId = user?.userId ?? null
        return sql.fragment`(
            ${this.UserId.Column} = ${userId} or
            (CAST(${userId} as integer) is null
                and ${this.Kind.Column} = ${RoleKinds.Public})
        )`
    }

    JoinViewToTableFn(
        userId: Column<typeof IdColumns['UserId']['Type'], string, "user_id">,
        linkId: Column<typeof IdColumns['GuildId']['Type'], string, C>
    ){
        const table = userId.Table!
        return (user: Nullable<Glenna.Id.User>) => sql.fragment`${table}
            on ${userId.Column} = ${this.UserId.Column}
            and ${linkId.Column} = ${this.LinkId.Column}
            and ${userId.Column} = CAST(${user?.userId ?? null} as integer)`
    }
}

export namespace UserTable {
    export const Table = Tables.User
    export const UserId = IdColumns.UserId
    export const DiscordId = new Column(Table, "discord_id", "discordId", z.bigint())
    export const Name = new Column(Table, "name", "name", z.string())
    export const Avatar = new Column(Table, "avatar", "avatar", z.string().nullable())

    export function MatchesDiscordId(user: Pick<APIUser, 'id'>){
        return sql.fragment`(${DiscordId.Column} = ${user.id})`
    }

    export function MatchesId(user: Glenna.Id.User){
        return sql.fragment`(${UserId.Column} = ${user.userId})`
    }

    const TableColumns = {
        [UserId.PropertyName]: UserId,
        [DiscordId.PropertyName]: DiscordId,
        [Name.PropertyName]: Name,
        [Avatar.PropertyName]: Avatar,
    } as const
    type TableColumnPropertyName = keyof typeof TableColumns
    type ColumnMap = { [Key in TableColumnPropertyName]: z.infer<typeof TableColumns[Key]['Type']> | SqlFragment }
    export type SetColumns<K extends TableColumnPropertyName> = Pick<ColumnMap, K>
    export function UpdateFragment<Keys extends TableColumnPropertyName>(properties: SetColumns<Keys>){
        const fragments = Object.entries(properties)
            .filter(pair => pair[1] !== undefined)
            .map(pair => sql.fragment`${TableColumns[pair[0] as TableColumnPropertyName].Insert()} = ${pair[1] as any}`)
        if(0 === fragments.length)
            return null
        return sql.join(fragments, sql.fragment`, `)
    }
}

export namespace ProfileTable {
    export const Table = Tables.Profile
    export const ProfileId = IdColumns.ProfileId
    export const UserId = UserTable.UserId.ForeignKey(Table)

    export const JoinUserToTable = sql.fragment`${Tables.User} on ${UserId.Column} = ${IdColumns.UserId.Column}`

    export function MatchesId(profile: Glenna.Id.Profile){
        return sql.fragment`(${ProfileId.Column} = ${profile.profileId})`
    }
}

export namespace RoleTable {
    export const Table = Tables.Role
    export const RoleId = IdColumns.RoleId
    export const Kind = new Column(Table, "kind", "kind", z.nativeEnum(RoleKind))
    export const GuildId = IdColumns.GuildId.ForeignKey(Table, Nullable)
    export const TeamId = IdColumns.TeamId.ForeignKey(Table, Nullable)
}

export namespace GuildTable {
    export const Table = Tables.Guild
    export const GuildId = IdColumns.GuildId
    export const DiscordId = new Column(Table, "discord_id", "discordId", z.bigint())
    export const Acronym = new Column(Table, "acronym", "acronym", z.string())
    export const Description = new Column(Table, "description", "description", z.string().nullable())
    export const ServerRegion = new Column(Table, "server_region", "serverRegion", z.nativeEnum(GuildServerRegion).nullable())
    export const Name = new Column(Table, "name", "name", z.string())
    export const Icon = new Column(Table, "icon", "icon", z.string().nullable())
    export const LastSeen = new Column(Table, "last_seen", "lastSeen", z.date())
    export const LookupAlias = new Column(Table, "lookup_alias", "lookupAlias", z.string())
    export const VanityCode = new Column(Table, "vanity_code", "vanityCode", z.string().nullable())

    export const PermissionRead = Column.Permission(Table, "permission_read")
    export const PermissionUpdate = Column.Permission(Table, "permission_update")
    export const PermissionTeamCreateDelete = Column.Permission(Table, "permission_team_create_delete")
    export const PermissionTeamDefaultUpdate = Column.Permission(Table, "permission_team_default_update")

    export function MatchesSlug(slug: string){
        return sql.fragment`(
            ${VanityCode.Column} = ${slug} or ${LookupAlias.Column} = ${slug}
        )`
    }

    export function MatchesDiscordId(guild: Pick<APIGuild, 'id'>){
        return sql.fragment`(${DiscordId.Column} = ${guild.id})`
    }

    export function NotRecentlySeen(){
        return sql.fragment`(${LastSeen.Column} < NOW() - interval '7 days')`
    }

    export const All = new ColumnSet({
        ...GuildId.Set,
        ...DiscordId.Set,
        ...Acronym.Set,
        ...Description.Set,
        ...ServerRegion.Set,
        ...Name.Set,
        ...Icon.Set,
        ...LastSeen.Set,
        ...VanityCode.Set,
        ...PermissionRead.Set,
    })

    export const Permissions = new ColumnSet({
        ...PermissionRead.Rename("read").Set,
        ...PermissionUpdate.Rename("update").Set,
        ...PermissionTeamCreateDelete.Rename("teamCreateDelete").Set,
        ...PermissionTeamDefaultUpdate.Rename("teamDefaultUpdate").Set,
    })
}

export const GuildReadView = new PermissionView(IdColumns.GuildId, GuildTable.PermissionRead)
export const GuildUpdateView = new PermissionView(IdColumns.GuildId, GuildTable.PermissionUpdate)

export namespace TempGuildTable {
    export const Table = Tables.TempGuild
    // not actually foreign keys, just copies
    export const GuildId = IdColumns.GuildId.ForeignKey(Table)
    export const DiscordId = GuildTable.DiscordId.ForeignKey(Table)

    export function MatchesAnyDiscordId(guilds: Pick<APIGuild, 'id'>[]){
        return sql.fragment`(${DiscordId.Column} = ${Database.anyBigintArray(guilds)})`
    }
}

export namespace GuildMemberTable {
    export const Table = Tables.GuildMember
    export const GuildMemberId = IdColumns.GuildMemberId
    export const GuildId = IdColumns.GuildId.ForeignKey(Table)
    export const UserId = IdColumns.UserId.ForeignKey(Table)

    export const JoinTableToReadView = GuildReadView.JoinViewToTableFn(UserId, GuildId)

    export function SelectIsMember(alias: string = "isMember"){
        return sql.fragment`(${GuildMemberId.Column} is not null) as ${sql.identifier([ alias ])}`
    }
}

export namespace TeamTable {
    export const Table = Tables.Team
    export const TeamId = IdColumns.TeamId
    export const GuildId = IdColumns.GuildId.ForeignKey(Table)
    export const DiscordRoleId = new Column(Table, "discord_role_id", "discordRoleId", z.bigint().nullable().or(z.string()))
    export const LeagueId = IdColumns.LeagueId.ForeignKey(Table, Nullable)
    export const Kind = new Column(Table, "kind", "kind", z.nativeEnum(TeamKind))
    export const Color = new Column(Table, "color", "color", z.number().int())
    export const Icon = new Column(Table, "icon", "icon", z.string().nullable())
    export const Name = new Column(Table, "name", "name", z.string())
    export const Focus = new Column(Table, "focus", "focus", z.nativeEnum(TeamFocus).array().nullable())
    export const Level = new Column(Table, "level", "level", z.nativeEnum(TeamLevel).nullable())
    export const PermissionRead = IdColumns.RoleId.ForeignKeyAs(Table, "permission_read", "permissionRead", Nullable)

    export const JoinTableToGuild = sql.fragment`
        ${Table} on ${GuildId.Column} = ${IdColumns.GuildId.Column}
    `

    export function MatchId(id: Glenna.Id.Team){
        return sql.fragment`(${TeamId.Column} = ${id.teamId})`
    }

    export function MatchesGuild(id: Glenna.Id.Guild){
        return sql.fragment`(${GuildId.Column} = ${id.guildId})`
    }

    export function IsManagementFor(guild: Glenna.Id.Guild){
        return sql.fragment`(${GuildId.Column} = ${guild.guildId} and ${Kind.Column} = ${TeamKinds.Management})`
    }

    export const All = new ColumnSet({
        ...GuildId.Set,
        ...Name.Set,
        ...DiscordRoleId.Set,
        ...Color.Set,
        ...Icon.Set,
        ...Kind.Set,
        ...PermissionRead.Set,
    })

    export const Permissions = new ColumnSet({
        ...PermissionRead.Rename("read").Set
    })

    export function InsertFragment<Keys extends keyof typeof All['Map']>(...properties: Keys[]){
        return sql.fragment`${Table}(${All.Insert(...properties)})`
    }
}

export const TeamReadView = new PermissionView(IdColumns.TeamId, TeamTable.PermissionRead)

export namespace TeamMemberTable {
    export const Table = Tables.TeamMember
    export const TeamMemberId = IdColumns.TeamMemberId
    export const TeamId = IdColumns.TeamId.ForeignKey(Table)
    export const GuildMemberId = IdColumns.GuildMemberId.ForeignKey(Table)

    namespace AugmentedView {
        export const View = view("app", "teammember_augmentedview")
        export const UserId = IdColumns.UserId.InView(View)
        export const TeamId = TeamMemberTable.TeamId.InView(View)
        export const TeamMemberId = IdColumns.TeamMemberId.InView(View)
    }

    export const JoinTableToReadView = TeamReadView.JoinViewToTableFn(AugmentedView.UserId, AugmentedView.TeamId)
    export function SelectIsMember(alias: string = "isMember"){
        return sql.fragment`(${AugmentedView.TeamMemberId.Column} is not null) as ${sql.identifier([ alias ])}`
    }
}

export namespace RoleMemberTable {
    export const Table = Tables.RoleMember
    export const RoleMemberId = z.number().int()
    export const RoleId = RoleTable.RoleId.ForeignKey(Table)
    export const UserId = IdColumns.UserId.ForeignKey(Table)
    export const TeamMemberId = IdColumns.TeamMemberId.ForeignKey(Table, Nullable)
}

export namespace LeagueTable {
    export const Table = Tables.League
    export const LeagueId = IdColumns.LeagueId
    export const Name = new Column(Table, "name", "name", z.string())

    export const JoinTableToTeam = sql.fragment`${Table}
        on ${LeagueId.Column} = ${TeamTable.LeagueId.Column}`
}

export namespace AllRoleMemberView {
    export const View = view("app", "permissionview")
    export const UserId = RoleMemberTable.UserId.InView(View, type => type.nullable())
}

export namespace GuildInfoView {
    export const View = view("app", "guild_infoview")
    export const GuildId = IdColumns.GuildId.InView(View)
    export const TeamCount = new Column(View, "teams", "teamCount", z.number().int())
    export const LeagueCount = new Column(View, "leagues", "leagueCount", z.number().int())
    export const MemberCount = new Column(View, "members", "memberCount", z.number().int())

    export const JoinViewToGuild = sql.fragment`
        ${View} on ${GuildId.Column} = ${IdColumns.GuildId.Column}
    `
}

export namespace TeamInfoView {
    export const View = view("app", "team_infoview")
    export const TeamId = IdColumns.TeamId.InView(View)
    export const MemberCount = new Column(View, "members", "memberCount", z.number().int())
    export const LeagueName = new Column(View, "league_name", "leagueName", z.string().nullable())

    export const JoinViewToTeam = sql.fragment`
        ${View} on ${TeamId.Column} = ${IdColumns.TeamId.Column}
    `
}
