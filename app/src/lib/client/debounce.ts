export function debouncer(time: number, entry: () => void){
    let timeout: ReturnType<typeof setTimeout>
    return {
        try(action: () => void){
            clearTimeout(timeout)
            entry?.()
            timeout = setTimeout(() => action(), time)
        }
    }
}
