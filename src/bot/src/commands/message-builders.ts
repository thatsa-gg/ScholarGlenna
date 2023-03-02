import { Awaitable, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "@glenna/discord"

type MessageCommandHandler = (interaction: MessageContextMenuCommandInteraction) => Awaitable<void>
export type MessageCommandHelper = ReturnType<typeof messageCommand>

export function messageCommand(name: string, args: {
    data?: (a: ContextMenuCommandBuilder) => ContextMenuCommandBuilder
    execute: MessageCommandHandler
}){
    let builder = new ContextMenuCommandBuilder().setName(name)
    args.data?.(builder)
    return {
        name, toJSON(){ return builder.toJSON() },
        execute: args.execute
    }
}
