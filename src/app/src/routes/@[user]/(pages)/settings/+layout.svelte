<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte'
    import SidebarButton from '$lib/components/SidebarButton.svelte'
    import SidebarDivider from '$lib/components/SidebarDivider.svelte'
    import Settings from '$lib/layouts/Settings.svelte'
    import { Gear16, Key16, Tools16 } from 'svelte-octicons';
    import type { LayoutData } from './$types'
    export let data: LayoutData
</script>

<div class="max-w-7xl mx-auto px-8 mt-6">
    <div class="grid gap-6">
        <Sidebar>
            <SidebarButton href={`/@${data.params.user.alias}/settings`}><Gear16 slot="leader" />General</SidebarButton>
            <SidebarDivider />
            <SidebarButton href={`/@${data.params.user.alias}/settings/builds`}><Tools16 slot="leader"/>Builds</SidebarButton>
            <SidebarButton href={`/@${data.params.user.alias}/settings/accounts`}><Key16 slot="leader"/>Accounts &amp; API Keys</SidebarButton>
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
    div.content {
        grid-area: content;
    }
</style>
