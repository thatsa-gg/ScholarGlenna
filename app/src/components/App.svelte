<script lang="ts">
    // Components
    import { drawerState, type DrawerState } from "./Drawer.svelte"
    import PrimaryDrawer from "./PrimaryDrawer.svelte"
    import ProfileDrawer from "./ProfileDrawer.svelte"
    import GlobalHeader from "./GlobalHeader.svelte"

    // Properties
    let primaryDrawer = drawerState()
    let profileDrawer = drawerState()
</script>

<PrimaryDrawer state={primaryDrawer} />
<ProfileDrawer state={profileDrawer} />

<header class="
    bg-primary-950 border-b border-primary-750 mb-4
    short:sticky top-0
">
    <GlobalHeader {primaryDrawer} {profileDrawer} />
    <slot name="header" />
</header>

<slot />

<style lang="postcss">
    :global(body){
        @apply min-w-96
            bg-primary-900
            text-gray-100
            pb-4;
    }
</style>
