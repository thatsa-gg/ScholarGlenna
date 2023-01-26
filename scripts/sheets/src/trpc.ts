import type { AppRouter } from '@glenna/api'
import { createTRPCProxyClient, httpLink } from '@trpc/client'
export const client = createTRPCProxyClient<AppRouter>({
    links: [
        httpLink({
            url: 'http://159.65.235.188:3000/trpc',
            fetch: async function(...args: Parameters<typeof UrlFetchApp.fetch>){
                const response = UrlFetchApp.fetch(...args)
                const status = response.getResponseCode()
                return {
                    status: status,
                    ok: status >= 200 && status < 300,
                    json(){
                        return JSON.parse(response.getContentText())
                    }
                }
            }
        })
    ]
})
