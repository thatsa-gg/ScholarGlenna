<script lang="ts">
    import LocalHeader from "$lib/components/LocalHeader.svelte"
    import LocalHeaderButton from "$lib/components/LocalHeaderButton.svelte"

    const baseUrl = "guild/team"
</script>

<LocalHeader label="Team">
    <LocalHeaderButton href={`/${baseUrl}`}>teamName</LocalHeaderButton>
    <LocalHeaderButton href={`/${baseUrl}/logs`}>Logs</LocalHeaderButton>
    <LocalHeaderButton href={`/${baseUrl}/settings`}>Settings</LocalHeaderButton>
</LocalHeader>
