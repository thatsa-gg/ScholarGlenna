<script lang="ts">
    import LocalHeader from "$lib/components/LocalHeader.svelte"
    import LocalHeaderButton from "$lib/components/LocalHeaderButton.svelte"

    const baseUrl = "guild/@team"
</script>

<LocalHeader label="Division">
    <LocalHeaderButton href={`/${baseUrl}`}>divisionName</LocalHeaderButton>
    <LocalHeaderButton href={`/${baseUrl}/logs`}>Logs</LocalHeaderButton>
    <LocalHeaderButton href={`/${baseUrl}/settings`}>Settings</LocalHeaderButton>
</LocalHeader>
