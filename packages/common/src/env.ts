const {
    PGHOST: _POSTGRES_HOST,
    PGPORT: _POSTGRES_PORT,
    POSTGRES_DB: _POSTGRES_DB,
    POSTGRES_USER: _POSTGRES_USER,
    POSTGRES_PASSWORD: _POSTGRES_PASSWORD,
    REDIS_HOST: _REDIS_HOST,
    REDIS_PORT: _REDIS_PORT,
} = process.env
if(!_POSTGRES_HOST) throw `[env] Missing: PGHOST`
if(!_POSTGRES_PORT) throw `[env] Missing: PGPORT`
if(!_POSTGRES_DB) throw `[env] Missing: POSTGRES_DB`
if(!_POSTGRES_USER) throw `[env] Missing: POSTGRES_USER`
if(!_POSTGRES_PASSWORD) throw `[env] Missing: POSTGRES_PASSWORD`
if(!_REDIS_HOST) throw `[env] Missing: REDIS_HOST`
if(!_REDIS_PORT) throw `[env] Missing: REDIS_PORT`
export const POSTGRES_HOST: string = _POSTGRES_HOST
export const POSTGRES_PORT: number = Number.parseInt(_POSTGRES_PORT)
export const POSTGRES_DB: string = _POSTGRES_DB
export const POSTGRES_USER: string = _POSTGRES_USER
export const POSTGRES_PASSWORD: string = _POSTGRES_PASSWORD
export const REDIS_HOST: string = _REDIS_HOST
export const REDIS_PORT: number = Number.parseInt(_REDIS_PORT)
