import type { AppRouter } from '@glenna/api'
import { createTRPCProxyClient, httpLink } from '@trpc/client'

export const client: ReturnType<typeof createTRPCProxyClient<AppRouter>> = createTRPCProxyClient<AppRouter>({
    links: [
        httpLink({
            url: 'http://159.65.235.188:3000/trpc',
            fetch: async function(...args){
                // fake the heck out of these types because it *technically* works for TRPC.
                const response = UrlFetchApp.fetch(...(args as Parameters<typeof UrlFetchApp['fetch']>))
                const status = response.getResponseCode()
                return {
                    status: status,
                    ok: status >= 200 && status < 300,
                    json(){
                        return JSON.parse(response.getContentText())
                    }
                } as Response
            }
        })
    ]
})
