import { extend } from './_common.js'
import { z } from 'zod'

import tzdata from 'tzdata' assert { type: "json" }
import { Builders, Fetchers } from './_builder.js'
const supportedZones = Object.keys(tzdata.zones)

const Timezone = Symbol('djs-timezone')
export function timezone(){
    const handler = z.string()
        .transform(a => [ a, supportedZones.find(b => b.toLowerCase() === a.toLowerCase()) ])
        .refine(([, r]) => r, ([ a ]) => ({ message: `Could not find a valid time zone ${a}.` }))
        .transform(([, r]) => r)
    return extend(handler, {
        type: Timezone,
        async autocomplete({ value }){

            const search = value.toLowerCase()
            const matching = supportedZones
                .filter(zone => zone.toLowerCase().includes(search))
                .map(zone => ({ name: zone, value: zone }))
            const smaller = [
                'America/Detroit',
                'America/Chicago',
                'America/Edmonton',
                'America/Los Angeles',
                'Europe/London',
                'Europe/Berlin',
                'Europe/Athens',
                'Europe/Istanbul',
                'Australia/Sydney',
                'Australia/South',
                'Australia/West',
                'UTC',
            ]
            if(matching.length > 25){
                const smallerMatch = smaller.filter(z => z.toLowerCase().includes(search))
                if(smallerMatch.length === 0)
                    return smaller.map(name => ({ name, value: name }))
                return smallerMatch.map(name => ({ name, value: name }))
            }
            return matching
        }
    })
}

Fetchers.set(Timezone, (name, required) => interaction => interaction.options.getString(name, required))
Builders.set(Timezone, (name, description, required) => builder => builder.addStringOption(option => {
    option.setName(name)
    option.setRequired(required)
    option.setAutocomplete(true)
    if(description)
        option.setDescription(description)
    return option
}))
