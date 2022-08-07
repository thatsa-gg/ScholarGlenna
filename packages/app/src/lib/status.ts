import type { ResponseBody, RequestHandlerOutput} from '@sveltejs/kit'
export function unauthorized(): RequestHandlerOutput<ResponseBody> {
    return {
        status: 401
    }
}

export function notFound(): RequestHandlerOutput<ResponseBody> {
    return {
        status: 404
    }
}

export function forbidden(): RequestHandlerOutput<ResponseBody> {
    return {
        status: 403
    }
}
