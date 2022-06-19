import { v4 as uuid } from 'uuid'

export type UUID = string & { __TYPE__: 'UUID' }
export const createUUID = uuid as (...args: Parameters<typeof uuid>) => UUID
