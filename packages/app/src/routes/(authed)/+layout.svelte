<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import TitleLink from "$lib/components/TitleLink.svelte";

    import type { LayoutServerData } from "./$types"
    export let data: LayoutServerData
</script>

<style lang="scss">
    #main-grid {
        width: 100%;
        min-height: 100vh;
        display: grid;
        grid: 60px auto / var(--width-sidebar) auto auto;
        grid-template-areas: "title header header" "sidebar content null";
    }
</style>

<div id="main-grid">
    <TitleLink />
    <PageHeader user={data.user} />
    <slot />
</div>
