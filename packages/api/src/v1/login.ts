import type { RouteOptions } from 'fastify'
import { resolveUrl } from '../route'
export default {
    method: 'GET',
    url: resolveUrl(import.meta),
} as RouteOptions
