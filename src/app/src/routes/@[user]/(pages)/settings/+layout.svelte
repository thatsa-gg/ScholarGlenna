<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte'
    import SidebarButton from '$lib/components/SidebarButton.svelte'
    import Settings from '$lib/layouts/Settings.svelte'
    import type { LayoutData } from './$types'
    export let data: LayoutData
</script>

<div class="max-w-7xl mx-auto px-8 mt-6">
    <div class="grid gap-6">
        <Sidebar>
            <SidebarButton href={``}>General</SidebarButton>
        </Sidebar>

        <div class="content">
            <slot />
        </div>
    </div>
</div>

<style lang="postcss">
    div.grid {
        grid-template: "sidebar content" min-content / 18rem auto;
    }
    nav.sidebar {
        grid-area: sidebar;
    }
    div.content {
        grid-area: content;
    }
</style>
