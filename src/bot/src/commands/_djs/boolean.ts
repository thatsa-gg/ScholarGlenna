import { z } from 'zod'
import { extend } from './_common.js'
import { Fetchers, Builders } from './_builder.js'

const Boolean = Symbol('djs-boolean')
export function boolean(){
    return extend(z.boolean(), { type: Boolean })
}

Fetchers.set(Boolean, (name, required) => interaction => interaction.options.getBoolean(name, required))
Builders.set(Boolean, (name, description, required, accessory) => builder => builder.addBooleanOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))
