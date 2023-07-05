<script lang="ts">
    import { page } from "$app/stores";
    export let href: string;
</script>

{#if $page.url.pathname == href}
    <span><slot /></span>
{:else}
    <a {href}><slot /></a>
{/if}

<style lang="postcss">

</style>
