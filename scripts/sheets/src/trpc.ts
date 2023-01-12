import type { AppRouter } from '@glenna/api'
import { createTRPCProxyClient, httpLink } from '@trpc/client'
export const client = createTRPCProxyClient<AppRouter>({
    links: [
        httpLink({
            url: 'http://159.65.235.188:3000/trpc',
            fetch: UrlFetchApp.fetch
        })
    ]
})
