import { client } from './trpc'

export async function DOUBLE(a: number){
    return await client.double.query(a)
}
