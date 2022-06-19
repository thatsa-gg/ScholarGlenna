export type Snowflake = number & { __TYPE__: 'Snowflake' }
export function asSnowflake(id: string): Snowflake {
    // TODO
    return 0 as Snowflake
}
