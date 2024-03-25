<script lang="ts">
    import type { Snippet } from "svelte"

    // Components
    import { drawerState } from "./Drawer.svelte"
    import PrimaryDrawer from "./PrimaryDrawer.svelte"
    import ProfileDrawer from "./ProfileDrawer.svelte"
    import GlobalHeader from "./GlobalHeader.svelte"

    // Properties
    const primaryDrawer = drawerState()
    const profileDrawer = drawerState()

    let { header: localHeader, children }: {
        header?: Snippet,
        children: Snippet
    } = $props()

    let headerHeight = $state()
</script>

<div class="contents" style="--app-header-height: calc({headerHeight}px + 1rem)">
    <PrimaryDrawer state={primaryDrawer} />
    <ProfileDrawer state={profileDrawer} />

    <header class="
        bg-primary-950 border-b border-primary-750 mb-4
        short:sticky top-0
    " bind:clientHeight={headerHeight}>
        <GlobalHeader {primaryDrawer} {profileDrawer} />
        {@render localHeader?.()}
    </header>

    {@render children()}
</div>

<style lang="postcss">
    :global(body){
        @apply min-w-96
            bg-primary-900
            text-gray-100
            pb-4;
    }
</style>
