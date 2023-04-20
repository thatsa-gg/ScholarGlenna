import { z } from 'zod'
import type {
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from '@glenna/discord'
import type {
    Authorization
} from '../_authorization.js'

export const DJSTypeSymbol = Symbol('djs-type')
export const DJSBuilderSymbol = Symbol('djs-builder')
export const DJSAutocompleteSymbol = Symbol('djs-autocomplete')

type OptionBuilder =
    | SlashCommandAttachmentOption
    | SlashCommandBooleanOption
    | SlashCommandChannelOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption

export type AutocompleteFn = (
    option: AutocompleteFocusedOption,
    interaction: AutocompleteInteraction,
    authorization?: Authorization<string>
) => Promise<{ name: string, value: string | number }[] | void>
export function isAutocompletable<T extends OptionBuilder>(candidate: T): candidate is T & { setAutocomplete(state: boolean): T } {
    return 'setAutocomplete' in candidate && typeof candidate.setAutocomplete === 'function'
}
export type BuilderFn<T extends OptionBuilder = OptionBuilder> = (b: T) => T

export type DJSObject<B extends OptionBuilder> = {
    [DJSTypeSymbol]: symbol
    [DJSBuilderSymbol]?: BuilderFn<B>
    [DJSAutocompleteSymbol]?: AutocompleteFn
}

export function isDjsObject(candidate: any): candidate is DJSObject<OptionBuilder> {
    return typeof candidate === 'object' && DJSTypeSymbol in candidate
}

export function extend<T extends z.ZodTypeAny, B extends OptionBuilder>(object: T, options: {
    type?: symbol
    builder?: BuilderFn<B> | null
    autocomplete?: AutocompleteFn
}){
    const { type, builder, autocomplete } = options
    const target = object._def as Partial<DJSObject<B>>
    if(type)
        target[DJSTypeSymbol] = type
    if(builder)
        target[DJSBuilderSymbol] = builder
    if(autocomplete)
        target[DJSAutocompleteSymbol] = autocomplete
    return object
}

export function custom<T>(type: symbol, ...params: Parameters<typeof z.custom<T>>){
    return extend(z.custom<T>(...params), { type })
}
