<script lang="ts">
    export let href: string | undefined = undefined
    export let label: string | undefined = undefined
</script>

{#if href}
    <a {href}
        title={label} aria-label={label}
        class="
            transition-colors hover:bg-primary-500
            flex items-center h-8 px-md py-sm
            rounded-md overflow-hidden
            text-ellipsis whitespace-nowrap
    "><slot /></a>
{:else}
    <span
        title={label} aria-label={label}
        class="
            flex items-center h-8 px-md py-sm
            rounded-md overflow-hidden
            text-ellipsis whitespace-nowrap
    "><slot /></span>
{/if}
