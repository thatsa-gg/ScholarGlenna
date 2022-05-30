import { dirname } from '@glenna/util'
import { relative, resolve, parse } from 'path/posix'
import { fileURLToPath } from 'url'

const basePath = dirname(import.meta)
export function resolveUrl(meta: ImportMeta, url?: string){
    const target = dirname(meta)
    const rel = relative(basePath, target)
    if(!url)
        url = parse(fileURLToPath(meta.url)).name
    return resolve('/api', rel, url)
}
