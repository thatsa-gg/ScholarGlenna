import ajv, { type JTDParser } from 'ajv/dist/jtd'
export type { JTDSchemaType } from 'ajv/dist/jtd'
export const Ajv = new ajv()
export class AjvParseError extends Error {
    constructor(parser: JTDParser){
        super(parser.message ?? `Unknown parser error at position ${parser.position ?? 'unknown'}`)
    }
}
export class BigIntParseError extends Error {
    property: string
    text: string
    constructor(text: string, property: string){
        super(`Error parsing ${property}: ${text} is not a valid bigint.`)
        this.property = property
        this.text = text
    }
}
export function tryParseBigInt(text: string | undefined, property: string): bigint | null {
    try {
        if(typeof text !== 'string' || text.length === 0)
            return null
        return BigInt(text)
    } catch(error){
        if(error instanceof SyntaxError)
            throw new BigIntParseError(text ?? '<undefined>', property)
        throw error
    }
}
