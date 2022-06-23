export interface DBEntityProperties {
    id: number
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
}
function isDBEntityProperties(a: any): a is DBEntityProperties { return a && a.created_at }
export class DBEntity {
    id: number
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null

    constructor(properties: Required<DBEntity> | DBEntityProperties){
        this.id = properties.id
        if(isDBEntityProperties(properties)){
            this.createdAt = properties.created_at
            this.updatedAt = properties.updated_at
            this.deletedAt = properties.deleted_at
        } else {
            this.createdAt = properties.createdAt
            this.updatedAt = properties.updatedAt
            this.deletedAt = properties.deletedAt
        }
    }
}

export class DiscordEntity extends DBEntity {
    snowflake: string

    constructor(properties: Required<DiscordEntity> | (DBEntityProperties & Omit<DiscordEntity, keyof DBEntity>)){
        super(properties)
        this.snowflake = properties.snowflake
    }
}
