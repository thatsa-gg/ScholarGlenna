<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte'
    import SidebarButton from '$lib/components/SidebarButton.svelte'
    import SidebarDivider from '$lib/components/SidebarDivider.svelte'
    import SidebarLabel from '$lib/components/SidebarLabel.svelte'
    import { Gear16, Key16, Tools16 } from 'svelte-octicons'
</script>

<div class="max-w-7xl mx-auto px-8 mt-6">
    <div class="grid gap-6">
        <Sidebar>
            <SidebarButton href="/settings"><Gear16 slot="leader" />General</SidebarButton>
            <SidebarDivider />
            <SidebarLabel>Guild Wars 2</SidebarLabel>
            <SidebarButton href="/settings/builds"><Tools16 slot="leader"/>Builds</SidebarButton>
            <SidebarButton href="/settings/accounts"><Key16 slot="leader"/>Accounts &amp; API Keys</SidebarButton>
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
