import { AppDataSource } from './database'
import { User } from './models/User'
export { User } from './models/User'
export const Users = AppDataSource.getRepository(User)

export interface IUser {
    id: string
    username: string
    discriminator: string
    avatar: string
}
