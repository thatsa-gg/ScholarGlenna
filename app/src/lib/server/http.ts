export namespace Http {
    export namespace Code {
        /** Permanent redirect */
        export const MovedPermanently = 301

        /** Temporary redirect */
        export const FoundElsewhere = 302

        /** Found, keep method. */
        export const TemporaryRedirect = 307

        /** Moved permanently, keep method. */
        export const PermanentRedirect = 308

        /** Unauthorized, requires signin */
        export const Unauthorized = 401

        /** Forbidden, requires *different* signin */
        export const Forbidden = 403
    }
}
