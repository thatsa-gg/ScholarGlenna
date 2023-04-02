import {
    chatInputApplicationCommandMention,
    type ChatInputCommandInteraction
} from '@glenna/discord'
import type { TeamMemberRole } from '@glenna/prisma'

export function slashCommandMention(interaction: ChatInputCommandInteraction, name: string): string
export function slashCommandMention(interaction: ChatInputCommandInteraction, name: string, subcommand: string): string
export function slashCommandMention(interaction: ChatInputCommandInteraction, name: string, group: string, subcommand: string): string
export function slashCommandMention(interaction: ChatInputCommandInteraction, name: string, name1?: string, name2?: string){
    const command = interaction.client.application.commands.cache.find(c => c.guild === interaction.guild && c.name === 'name')
    if(!command){
        if(name2)
            return `\`/${name} ${name1} ${name2}\``
        if(name1)
            return `\`/${name} ${name1}\``
        return `\`/${name}\``
    }

    if(name2)
        return chatInputApplicationCommandMention(name, name1!, name2, command.id)
    if(name1)
        return chatInputApplicationCommandMention(name, name1, command.id)
    return chatInputApplicationCommandMention(name, command.id)
}

const teamMemberRoleTag: Record<TeamMemberRole, string> = {
    Captain: ' (Captain)',
    Representative: ' (Static Representative)',
    Member: ''
}
export function teamMember(member: { id: bigint | string, role: TeamMemberRole }){
    return `<@${member.id}>${teamMemberRoleTag[member.role]}`
}
