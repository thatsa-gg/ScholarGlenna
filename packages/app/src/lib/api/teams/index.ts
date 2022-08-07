import { Ajv, AjvParseError, tryParseBigInt, type JTDSchemaType } from '../ajv.js'
import type { TeamInfo } from '@glenna/common'

export interface IncomingTeamInfo {
    name: string
    alias?: string
    role?: string
    channel?: string
    description?: string
    sync?: boolean
}

const schema: JTDSchemaType<IncomingTeamInfo> = {
    properties: {
        name: { type: "string",  }
    },
    optionalProperties: {
        alias: { type: "string" },
        role: { type: "string" },
        channel: { type: "string" },
        sync: { type: "boolean" },
        description: { type: "string" }
    }
}
export const parser = Ajv.compileParser(schema)
export function parse(text: string): TeamInfo {
    const parsed = parser(text)
    if(!parsed)
        throw new AjvParseError(parser)
    return {
        name: parsed.name,
        alias: parsed.alias || undefined,
        description: parsed.description || null,
        role: tryParseBigInt(parsed.role, 'role'),
        channel: tryParseBigInt(parsed.channel, 'channel'),
        sync: parsed.sync || false
    }
}
