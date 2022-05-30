import fastifyPlugin from 'fastify-plugin'
import { AuthorizationCode, ModuleOptions } from 'simple-oauth2'
import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } from '@glenna/common'

const ClientConfig: ModuleOptions<"client_id"> = {
    client: {
        id: OAUTH_CLIENT_ID,
        secret: OAUTH_CLIENT_SECRET,
    },
    auth: {
        tokenHost: 'https://discord.com',
        tokenPath: '/api/oauth2/token',
        authorizePath: '/api/oauth2/authorize',
        revokePath: '/api/oauth2/token/revoke',
    },
}

export interface OAuth2Options {
    /** name of the property on the fastify request; e.g. oauth2 */
    name: string,
    /** e.g. /login/oauth2 */
    initLoginPath: string,
    /** e.g. http://localhost:8080/login/oauth2/callback */
    callbackUri: string,
}
export const OAuth2Client = new AuthorizationCode(ClientConfig)
export const OAuth2Plugin = fastifyPlugin<OAuth2Options>(async function(instance, options){
    const plugin = {
        client: OAuth2Client,
        get authorizationUri(){
            return OAuth2Client.authorizeURL({
                redirect_uri: options.callbackUri,
                state: undefined // TODO: https://auth0.com/docs/secure/attack-protection/state-parameters
            })
        }
    }
    instance.get(options.initLoginPath, {}, (_, reply) => {
        reply.redirect(plugin.authorizationUri)
    })
    instance.decorate(options.name, plugin)
}, {
    fastify: '>=3.x',
    name: 'glenna-oauth2',
})
