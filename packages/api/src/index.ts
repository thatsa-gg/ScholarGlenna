import fastify from 'fastify'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { createContext } from './context.js'
import { appRouter } from './router.js'

export { AppRouter } from './router'

const server = fastify({ maxParamLength: 5000 })
server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
        router: appRouter,
        createContext
    }
})

void async function(){
    try {
        await server.listen({ port: 3000 })
    } catch(err){
        server.log.error(err)
        process.exit(1)
    }
}()
