import { Columns } from "../lib/columns"
import { AppSchema } from "./schema-app"

export const Profile = AppSchema.Table("profile", {
    ProfileId: Columns.PrimaryKey("profile_id"),
    UserId: Columns.Integer("user_id").Unique(),
})
