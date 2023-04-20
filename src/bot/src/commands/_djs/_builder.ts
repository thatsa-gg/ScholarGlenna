import type {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from '@glenna/discord'

export type FetcherFn = (name: string, required: boolean) => (interaction: ChatInputCommandInteraction) => unknown
export type BuilderFn = (name: string, description: string | undefined, required: boolean, accessoryBuilder?: Function) =>
    (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) => unknown

export const Ignore: BuilderFn = () => () => {}

export const Fetchers = new Map<PropertyKey, FetcherFn>()
export const Builders = new Map<PropertyKey, BuilderFn>()
