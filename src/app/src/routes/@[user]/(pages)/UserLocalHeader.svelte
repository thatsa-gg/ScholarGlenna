<script lang="ts">
    import LocalHeader from "$lib/components/LocalHeader.svelte"
    import LocalHeaderButton from "$lib/components/LocalHeaderButton.svelte"
    import type { LayoutServerData } from "../$types"
    import { page } from "$app/stores"

    export let user: NonNullable<LayoutServerData['params']['user']>
    $: path = $page.url.pathname
</script>

<LocalHeader label="User">
    <LocalHeaderButton href={`/@${user.alias}`} active={path === `/@${user.alias}`}>Profile</LocalHeaderButton>
    <LocalHeaderButton href={`/@${user.alias}/logs`} active={path.startsWith(`/@${user.alias}/logs`)}>Logs</LocalHeaderButton>
    <LocalHeaderButton href={`/@${user.alias}/builds`} active={path.startsWith(`/@${user.alias}/builds`)}>Builds</LocalHeaderButton>
    <LocalHeaderButton href={`/@${user.alias}/accounts`} active={path.startsWith(`/@${user.alias}/accounts`)}>Accounts</LocalHeaderButton>
    <LocalHeaderButton href={`/@${user.alias}/settings`} active={path.startsWith(`/@${user.alias}/settings`)}>Settings</LocalHeaderButton>
</LocalHeader>
