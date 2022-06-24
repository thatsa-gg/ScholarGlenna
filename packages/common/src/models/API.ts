export namespace API {
    export interface DiscordUserInfo {
        id: string
        username: string
        discriminator: string
        avatar: string
    }

    export interface DiscordGuildInfo {
        id: string
        name: string
        icon: string | null
        description: string | null
        preferredLocale: string
        ownerId: string
    }
}
