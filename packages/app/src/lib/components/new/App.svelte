<script lang="ts">
    import Sidebar from './Sidebar.svelte'
    import ScrollArea from './ScrollArea.svelte'
    import type { UserInfo } from './navigation/NavigationFooter.svelte'

    export let name: string = '/-/dashboard'
    export let user: UserInfo
</script>

<div>
    <Sidebar { name } { user }>
        <slot name="banner" />
        <slot name="contents" />
        <ScrollArea>
            <slot name="navigation" />
        </ScrollArea>
    </Sidebar>
    <main { name }>
        <slot />
    </main>
</div>

<style lang="scss">
    div {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid: 1fr / var(--width-sidebar) auto;
        grid-template-areas: "sidebar main";
    }
    main {
        grid-area: main;
        height: 100%;
        max-width: 800px;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
    }
</style>
