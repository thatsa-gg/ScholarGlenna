import { z } from 'zod'
import { extend } from './_common.js'
import { Fetchers, Builders } from './_builder.js'
import type { SlashCommandIntegerOption, SlashCommandNumberOption } from '@glenna/discord'

const Number = Symbol('djs-number')
const Integer = Symbol('djs-integer')
export function number(min?: number, max?: number){
    if(min){
        if(max)
            return extend(z.number().min(min).max(max), {
                type: Number,
                builder(builder: SlashCommandNumberOption){
                    return builder.setMinValue(min).setMaxValue(max)
                }
            })
        else
            return extend(z.number().min(min), {
                type: Number,
                builder(builder: SlashCommandNumberOption){
                    return builder.setMinValue(min)
                }
            })
    } else if(max){
        return extend(z.number().max(max), {
            type: Number,
            builder(builder: SlashCommandNumberOption){
                return builder.setMaxValue(max)
            }
        })
    } else {
        return extend(z.number(), { type: Number })
    }
}

Fetchers.set(Number, (name, required) => interaction => interaction.options.getNumber(name, required))
Builders.set(Number, (name, description, required, accessory) => builder => builder.addNumberOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))

export function integer(min?: number, max?: number){
    if(min){
        if(max)
            return extend(z.number().int().min(min).max(max), {
                type: Integer,
                builder(builder: SlashCommandIntegerOption){
                    return builder.setMinValue(min).setMaxValue(max)
                }
            })
        else
            return extend(z.number().min(min), {
                type: Integer,
                builder(builder: SlashCommandIntegerOption){
                    return builder.setMinValue(min)
                }
            })
    } else if(max){
        return extend(z.number().max(max), {
            type: Integer,
            builder(builder: SlashCommandIntegerOption){
                return builder.setMaxValue(max)
            }
        })
    } else {
        return extend(z.number(), { type: Integer })
    }
}

Fetchers.set(Integer, (name, required) => interaction => interaction.options.getInteger(name, required))
Builders.set(Integer, (name, description, required, accessory) => builder => builder.addIntegerOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))
