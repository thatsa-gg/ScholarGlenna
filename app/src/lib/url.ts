export namespace ClientAppUrl {
    export function login(returnUrl?: URL | `/${string}`){
        if(!returnUrl)
            return "/auth/sso"
        else if(typeof returnUrl === 'string')
            return `/auth/sso?redirect_uri=${encodeURIComponent(returnUrl)}`
        else
            return `/auth/sso?redirect_uri=${encodeURIComponent(
                returnUrl.pathname +
                returnUrl.search +
                returnUrl.hash
            )}`
    }

    export const LogOut = "/auth/signout"
    export const Settings = "/settings"
    export const SettingsBuilds = "/settings/builds"
    export const SettingsAccounts = "/settings/accounts"
    export const Guilds = "/guilds"

    export function isSettings(url: URL | string){
        const path = typeof url === 'string' ? url : url.pathname
        return path.startsWith(Settings)
    }
}
