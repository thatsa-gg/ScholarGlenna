export function clickOutside(node: Node){
    const handle = (event: MouseEvent) => {
        if(node && !node.contains(event.target as Node) && !event.defaultPrevented){
            node.dispatchEvent(new CustomEvent<Node>('clickOutside', node as CustomEventInit<Node>))
        }
    }
    document.addEventListener('click', handle, true)
    return {
        destroy(){
            document.removeEventListener('click', handle, true)
        }
    }
}
