import { createLogger, format, transports } from 'winston'

const errorFormat = format(info => {
    if(info instanceof Error){
        Object.assign(info, { message: info.stack })
    }
    return info
})
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        errorFormat(),
        format.colorize(),
        format.splat(),
        format.printf(({ level, message }) => `${level}: ${message}`)
    ),
    transports: [
        new transports.Console({ level: 'info' })
    ]
})

export const {
    info,
    warn,
    error,
    debug,
} = logger
