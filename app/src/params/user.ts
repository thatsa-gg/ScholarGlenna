const excluded = new Set([
    "me",
    "everyone",
    "here"
])

export function match(param){
    // https://discord.com/developers/docs/resources/user#usernames-and-nicknames
    return param.length >= 2
        && param.length <= 32
        && !excluded.has(param)
        && !/[@#:]|```|discord|^\s|\s$/.test(param)
}
