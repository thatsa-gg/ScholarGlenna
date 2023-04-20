import { extend, type AutocompleteFn, isDjsObject, DJSBuilderSymbol, isAutocompletable } from './_common.js'
import type { z } from 'zod'

export function autocomplete<T extends z.ZodTypeAny>(object: T, options: { autocomplete: AutocompleteFn }){
    const builder = isDjsObject(object) ? object[DJSBuilderSymbol] : null
    return extend(object, {
        autocomplete: options.autocomplete,
        builder(b){
            if(isAutocompletable(b))
                b.setAutocomplete(true)
            else
                throw `Tried to autocomplete an un-autocompletable option!`
            builder?.(b)
            return b
        }
    })
}
