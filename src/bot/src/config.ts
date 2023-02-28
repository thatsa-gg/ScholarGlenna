const {
    OAUTH_CLIENT_ID: _OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET: _OAUTH_CLIENT_SECRET,
    DISCORD_TOKEN: _DISCORD_TOKEN,
} = process.env
if(!_OAUTH_CLIENT_ID) throw `[env] Missing: OAUTH_CLIENT_ID`
if(!_OAUTH_CLIENT_SECRET) throw `[env] Missing: OAUTH_CLIENT_SECRET`
if(!_DISCORD_TOKEN) throw `[env] Missing: DISCORD_TOKEN`
export const OAUTH_CLIENT_ID: string = _OAUTH_CLIENT_ID
export const OAUTH_CLIENT_SECRET: string = _OAUTH_CLIENT_SECRET
export const DISCORD_TOKEN: string = _DISCORD_TOKEN

export const VERSION = "0.0.1" // TODO: load this from the package.json
