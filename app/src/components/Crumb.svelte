<script lang="ts">
    import type { Snippet } from "svelte"
    let { href, label, children }: {
        href?: string
        label?: string
        children: Snippet
    } = $props()
</script>

{#if href}
    <a {href}
        title={label} aria-label={label}
        class="
            transition-colors hover:bg-primary-500
            flex items-center h-8 px-md py-sm
            rounded-md overflow-hidden
            text-ellipsis whitespace-nowrap
    ">{@render children()}</a>
{:else}
    <span
        title={label} aria-label={label}
        class="
            flex items-center h-8 px-md py-sm
            rounded-md overflow-hidden
            text-ellipsis whitespace-nowrap
    ">{@render children()}</span>
{/if}
