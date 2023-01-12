import { client } from './trpc'
export const DOUBLE = async (a: number) => await client.double.query(a)
