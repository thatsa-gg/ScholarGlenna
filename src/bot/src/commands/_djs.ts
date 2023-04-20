import { z } from 'zod'
import { DJSAutocompleteSymbol, DJSBuilderSymbol, DJSTypeSymbol, isDjsObject, type AutocompleteFn } from './_djs/_common.js'
import { Builders, Fetchers } from './_djs/_builder.js'
import type { SlashCommandBuilder, SlashCommandSubcommandBuilder, ChatInputCommandInteraction } from '@glenna/discord'

import { channel } from './_djs/channel.js'
import { role, guild, user, actor } from './_djs/discord.js'
import { string, snowflake } from './_djs/string.js'
import { number, integer } from './_djs/number.js'
import { autocomplete } from './_djs/autocomplete.js'
import { team } from './_djs/team.js'
import { timezone } from './_djs/timezone.js'
import { nativeEnum, stringEnum, } from './_djs/enum.js'
import { boolean } from './_djs/boolean.js'
export const djs = {
    actor,
    autocomplete,
    boolean,
    channel,
    guild,
    integer,
    nativeEnum,
    number,
    role,
    snowflake,
    string,
    stringEnum,
    team,
    timezone,
    user,
}

export type { AutocompleteFn, BuilderFn } from './_djs/_common.js'
export type Entry = {
    name: string
    builder: ((builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) => unknown)
    fetcher: ((interaction: ChatInputCommandInteraction) => unknown)
    autocomplete: AutocompleteFn
}

function hasDef(o: object): o is Pick<z.ZodAny, '_def'> { return '_def' in o }
function hasSchema(o: object): o is Pick<z.ZodEffectsDef, 'schema'> { return 'schema' in o }
function hasInnerType(o: object): o is Pick<z.ZodEffects<any>, 'innerType'> { return 'innerType' in o }

function inspect(name: string, zodType: z.ZodTypeAny): Entry {
    if(zodType.isOptional())
        throw `Option ${name} cannot be optional! Did you mean to use nullable() instead?`
    const required = !zodType.isNullable()
    let obj = zodType._def
    let description: string | undefined = undefined
    while(obj){
        if('description' in obj)
            description ??= obj.description
        if('defaultValue' in obj)
            throw `Option ${name} cannot have a default value! Instead, use nullable().transform()`
        if(isDjsObject(obj))
            break
        if(hasDef(obj))
            obj = obj._def
        else if(hasSchema(obj))
            obj = obj.schema
        else if(hasInnerType(obj))
            obj = obj.innerType
        else
            throw `Unknown object type, cannot traverse tree!`
    }
    if(!obj)
        throw `Could not find type for ${name}!`

    const type: symbol = obj[DJSTypeSymbol]
    const builder = Builders.get(type)?.(name, description, required, obj[DJSBuilderSymbol])
    const fetcher = Fetchers.get(type)?.(name, required)
    if(!builder)
        throw `Could not find builder for ${name}: ${String(type)}`
    if(!fetcher)
        throw `Could not find fetcher for ${name}: ${String(type)}`
    return { name, builder, fetcher, autocomplete: obj[DJSAutocompleteSymbol] }
}

export function parseCommandOptions(object: z.AnyZodObject | undefined){
    if(!object)
        return []
    return Object.entries<z.ZodTypeAny>(object.shape).map(([ name, value ]) => inspect(name, value))
}
