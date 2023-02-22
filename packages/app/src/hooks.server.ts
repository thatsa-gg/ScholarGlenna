import type { Handle } from '@sveltejs/kit'
import { createTRPCHandle } from 'trpc-sveltekit'
import { router } from '@glenna/api'

// see also: routes/api/trpc/README.md
export const handle: Handle = createTRPCHandle({
    url: '/api/trpc',
    router,
})
