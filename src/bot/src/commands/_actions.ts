import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} from '@glenna/discord'

type RestOrArray<T> = T[] | [ T[] ]
export namespace actions {
    export function buttons(...buttons: RestOrArray<ButtonBuilder>){
        return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)
    }

    export function select(select: StringSelectMenuBuilder){
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
    }
}

export namespace button {
    export function primary(id: string, label: string){
        return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Primary)
    }

    export function secondary(id: string, label: string){
        return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Secondary)
    }
}

export function select(id: string, placeholder: string, ...options: Parameters<StringSelectMenuBuilder['addOptions']>){
    return new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(placeholder)
        .addOptions(...options)
}
