export class Debouncer {
    #time: number
    #timeout: ReturnType<typeof setTimeout> | undefined
    #onEnter: (() => void) | undefined

    constructor(time: number, events?: {
        onEnter?: () => void
    }){
        this.#time = time
        this.#onEnter = events?.onEnter
    }

    debounce(action: () => void){
        clearTimeout(this.#timeout)
        this.#onEnter?.()
        this.#timeout = setTimeout(() => action(), this.#time)
    }
}
