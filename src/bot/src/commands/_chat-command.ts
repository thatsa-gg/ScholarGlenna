import type { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload } from '@glenna/discord'
import type { z } from 'zod'
import type { Command } from '.'
import { parseCommandOptions } from './_djs.js'

export function delegate(options: {
    description: string
    members: {
        [name: string]: Command<'chat' | 'subcommand'>
    }
}): Command<'chat' | 'command'> {
    const members = new Map(Object.entries(options.members))
    return {
        description: options.description,
        command(builder){
            for(const [ key, value ] of members.entries()){
                builder.addSubcommand(builder => {
                    builder.setName(key).setDescription(value.description)
                    value.subcommand(builder)
                    return builder
                })
            }
            return builder
        },
        async chat(interaction){
            const subcommand = interaction.options.getSubcommand(true)
            const target = members.get(subcommand)
            if(!target){
                await interaction.reply({
                    ephemeral: true,
                    content: `Unrecognized command!`
                })
                return
            }
            await target.chat(interaction)
        }
    }
}

export function command<TInput extends z.AnyZodObject>(options: {
    description: string
    input?: TInput,
    execute(options: z.infer<TInput>, interaction: ChatInputCommandInteraction): Promise<void | string | InteractionReplyOptions | MessagePayload>
}): Command<'chat' | 'subcommand'> {
    const inputs = parseCommandOptions(options.input)
    return {
        description: options.description,
        subcommand(builder){
            for(const input of inputs)
                input.builder(builder)
            return builder
        },
        async chat(interaction: ChatInputCommandInteraction): Promise<void> {
            const input = options.input?.parse(Object.fromEntries(inputs.map(({ name, fetcher }) => [ name, fetcher(interaction) ]))) ?? {}
            const result = await options.execute(input, interaction)
            if(typeof result !== 'undefined')
                await interaction.reply(result)
        }
    }
}
