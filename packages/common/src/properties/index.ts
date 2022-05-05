export const {
    DISCORD_TOKEN,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
} = (await import('../../../../config.json', { assert: { type: 'json' }})).default

export const {
    version: VERSION,
} = (await import('../../../../package.json', { assert: { type: 'json' }})).default
