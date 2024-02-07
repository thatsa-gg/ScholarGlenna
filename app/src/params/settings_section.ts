const sections = new Set([
    "accounts",
    "builds",
])

export function match(param){
    return sections.has(param)
}
