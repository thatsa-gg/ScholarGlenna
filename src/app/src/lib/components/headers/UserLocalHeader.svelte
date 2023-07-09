<script lang="ts">
    import LocalHeader from "$lib/components/LocalHeader.svelte"
    import LocalHeaderButton from "$lib/components/LocalHeaderButton.svelte"
    import { page } from "$app/stores"
    import { Gear16, Log16, Person16 } from "svelte-octicons"

    export let profile: {
        alias: string
        name: string
    }
    export let ownProfile: boolean
    $: path = $page.url.pathname
</script>

<LocalHeader label="User">
    <LocalHeaderButton href={`/@${profile.alias}`} active={path === `/@${profile.alias}`}><Person16 slot="leader" /> Profile</LocalHeaderButton>
    <LocalHeaderButton href={`/@${profile.alias}/logs`} active={path.startsWith(`/@${profile.alias}/logs`)}><Log16 slot="leader" />Logs</LocalHeaderButton>
    {#if ownProfile}
        <LocalHeaderButton href={`/settings`} active={path.startsWith(`/settings`)}><Gear16 slot="leader" />Settings</LocalHeaderButton>
    {/if}
</LocalHeader>
