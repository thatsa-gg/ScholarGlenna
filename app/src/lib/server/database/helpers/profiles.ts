import { Profile } from "../schema/table-profile"

export namespace Profiles {
    export function Matches(profile: Glenna.Id.Profile){
        return Profile.ProfileId.Condition("=", profile.profileId)
    }
}
