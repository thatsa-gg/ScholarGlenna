import { z } from 'zod'
import { extend } from './_common.js'
import { Fetchers, Builders } from './_builder.js'

const String = Symbol('djs-string')
export function string(){
    return extend(z.string(), { type: String })
}

export function _snowflake(){
    return z.string().regex(/^\d+$/).transform(a => BigInt(a))
}
export function snowflake(){
    return extend(_snowflake(), { type: String })
}

Fetchers.set(String, (name, required) => interaction => interaction.options.getString(name, required))
Builders.set(String, (name, description, required, accessory) => builder => builder.addStringOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))
