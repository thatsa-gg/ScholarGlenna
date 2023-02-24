let state: any = null
const targets = new Map<string, HTMLElement>()
export function internal(node: HTMLAnchorElement) {
    function handle(event: MouseEvent) {
        if (node.contains(event.target as Node)) {
            const href = node.getAttribute('href')
            if (!href)
                return
            const target = targets.get(href)
            if (target) {
                event.preventDefault()
                event.stopPropagation()
                history.pushState(state, '', href)
                target.scrollIntoView({ behavior: 'smooth' })
                target.scroll({ behavior: 'smooth', top: 0, left: 0 })
            }
        }
    }
    document.addEventListener("click", handle, true)
    return {
        destroy() {
            document.removeEventListener("click", handle, true)
        }
    }
}

export function target(node: HTMLElement) {
    const name = node.getAttribute('name')
    if (!name)
        return
    if (targets.has(name))
        throw `Duplicate internal target ref ${name}!`
    targets.set(name, node)
    if (location.pathname == name) {
        node.scrollIntoView()
        node.scroll({ top: 0, left: 0 })
    }
    return {
        destroy() {
            targets.delete(name)
        }
    }
}

export function popstate(event: PopStateEvent) {
    state = event.state
    const target = targets.get(location.pathname)
    if(target){
        target.scrollIntoView({ behavior: 'smooth' })
        target.scroll({ behavior: 'smooth', top: 0, left: 0 })
    }
}
