import type { JsonSafe } from '@glenna/util'
import type { UserProfile as _UserProfile } from '@glenna/common'

export type UserProfile = JsonSafe<_UserProfile> & { displayName: string } & {
    guilds?: []
    teams?: []
}
