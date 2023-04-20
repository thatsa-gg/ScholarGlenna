import { extend } from './_common.js'
import {
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandStringOption,
} from '@glenna/discord'
import { Builders, Fetchers } from './_builder.js'
import { z } from 'zod'

const StringEnum = Symbol('djs-string-enum')
export function stringEnum<U extends string, T extends Readonly<[U, ...U[]]>>(values: T){
    const choices = values.map(value => ({ name: value, value }))
    if(choices.length > 25)
        throw `Too many options! (max 25)`
    return extend(z.enum(values), {
        type: StringEnum,
        builder(option: SlashCommandStringOption){
            return option.addChoices(...choices)
        }
    })
}

Fetchers.set(StringEnum, (name, required) => interaction => interaction.options.getString(name, required))
Builders.set(StringEnum, (name, description, required, accessory) => builder => builder.addStringOption(option => {
    accessory!(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))

const IntegerEnum = Symbol('djs-integer-enum')
export function intEnum<U extends number, T extends Readonly<[U, ...U[]]>>(values: T){
    for(const option of values)
        if(!Number.isInteger(option))
            throw `Integer Enum Option ${option} is not an integer!`
    const choices = values.map(value => ({ name: value.toString(), value }))
    if(choices.length > 25)
        throw `Too many options! (max 25)`
    return extend(z.union(values.map(value => z.literal(value)) as unknown as readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]), {
        type: IntegerEnum,
        builder(option: SlashCommandIntegerOption){
            return option.addChoices(...choices)
        }
    })
}

Fetchers.set(IntegerEnum, (name, required) => interaction => interaction.options.getInteger(name, required))
Builders.set(IntegerEnum, (name, description, required, accessory) => builder => builder.addIntegerOption(option => {
    accessory!(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))

const NumberEnum = Symbol('djs-integer-enum')
export function numberEnum<U extends number, T extends Readonly<[U, ...U[]]>>(values: T){
    const choices = values.map(value => ({ name: value.toString(), value }))
    if(choices.length > 25)
        throw `Too many options! (max 25)`
    return extend(z.union(values.map(value => z.literal(value)) as unknown as readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]), {
        type: NumberEnum,
        builder(option: SlashCommandNumberOption){
            return option.addChoices(...choices)
        }
    })
}

Fetchers.set(NumberEnum, (name, required) => interaction => interaction.options.getNumber(name, required))
Builders.set(NumberEnum, (name, description, required, accessory) => builder => builder.addNumberOption(option => {
    accessory!(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))

export function nativeEnum<T extends z.EnumLike>(e: T){
    const entries = Object.entries(e)
    const candidates = entries.filter(([key]) => !/^\d+$/.test(key))
    if(typeof candidates[0]?.[1] === 'string'){
        if(candidates.length !== entries.length)
            throw `String NativeEnum must have only string keys (${candidates.length} != ${entries.length}).`
        const options = candidates.filter((pair): pair is [string, string] => typeof pair[1] === 'string')
        if(options.length !== candidates.length)
            throw `String NativeEnum must have only string values (${JSON.stringify(Object.fromEntries(candidates))}).`
        if(options.length > 25)
            throw `Too many options! (max 25)`
        const choices = options.map(([ name, value ]) => ({ name, value }))
        return extend(z.nativeEnum(e), {
            type: StringEnum,
            builder(option: SlashCommandStringOption){
                return option.addChoices(...choices)
            }
        })
    }

    // must be an int enum
    if(candidates.length !== entries.length && candidates.length * 2 !== entries.length)
        throw `Number NativeEnum must have either only string keys, or only number values (${candidates.length} !~= ${entries.length}).`
    const options = candidates.filter((pair): pair is [string, number] => Number.isInteger(pair[1]))
    if(options.length !== candidates.length)
        throw `Number NativeEnum must have only integer values (${JSON.stringify(Object.fromEntries(candidates))}).`
    const choices = options.map(([ name, value ]) => ({ name, value }))
    return extend(z.nativeEnum(e), {
        type: IntegerEnum,
        builder(option: SlashCommandIntegerOption){
            return option.addChoices(...choices)
        }
    })
}
