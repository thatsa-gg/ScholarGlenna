<script lang="ts">
    import LocalHeader from "$lib/components/LocalHeader.svelte"
    import LocalHeaderButton from "$lib/components/LocalHeaderButton.svelte"
    import type { LayoutServerData } from "../$types"
    import { page } from "$app/stores"
    import { Gear16, Log16, Person16 } from "svelte-octicons"

    export let user: NonNullable<LayoutServerData['params']['user']>
    $: path = $page.url.pathname
</script>

<LocalHeader label="User">
    <LocalHeaderButton href={`/@${user.alias}`} active={path === `/@${user.alias}`}><Person16 slot="leader" /> Profile</LocalHeaderButton>
    <LocalHeaderButton href={`/@${user.alias}/logs`} active={path.startsWith(`/@${user.alias}/logs`)}><Log16 slot="leader" />Logs</LocalHeaderButton>
    <LocalHeaderButton href={`/@${user.alias}/settings`} active={path.startsWith(`/@${user.alias}/settings`)}><Gear16 slot="leader" />Settings</LocalHeaderButton>
</LocalHeader>
