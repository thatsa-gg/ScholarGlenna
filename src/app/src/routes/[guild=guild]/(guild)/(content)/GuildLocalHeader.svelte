<script lang="ts">
    import LocalHeader from "$lib/components/LocalHeader.svelte"
    import LocalHeaderButton from "$lib/components/LocalHeaderButton.svelte"

    const guildAlias = "todo"
</script>

<LocalHeader label="Team">
    <LocalHeaderButton href={`/${guildAlias}`}>guildName</LocalHeaderButton>
    <LocalHeaderButton href={`/${guildAlias}/-/divisions`}>Divisions</LocalHeaderButton>
    <LocalHeaderButton href={`/${guildAlias}/-/teams`}>Teams</LocalHeaderButton>
    <LocalHeaderButton href={`/${guildAlias}/-/logs`}>Logs</LocalHeaderButton> <!-- also leaderboards -->
    <LocalHeaderButton href={`/${guildAlias}/-/apply`}>Apply</LocalHeaderButton> <!-- application form -->
    <LocalHeaderButton href={`/${guildAlias}/-/members`}>Members</LocalHeaderButton>
    <LocalHeaderButton href={`/${guildAlias}/-/settings`}>Settings</LocalHeaderButton> <!-- access audit log through here -->
</LocalHeader>
