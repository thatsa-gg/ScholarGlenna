<script lang="ts">
    import type { Snippet } from "svelte"

    // Components
    import LocalHeaderRow from "./LocalHeaderRow.svelte"

    // Properties
    let { label, multirow = false, children }: {
        label?: string
        multirow?: boolean
        children: Snippet
    } = $props()
</script>

<div class="flex flex-row gap-2 pl-4 pr-16 sm:pr-4">
    <nav class="flex flex-row flex-wrap justify-start w-full gap-y-1" aria-label={label}>
        {#if multirow}
            {@render children()}
        {:else}
            <LocalHeaderRow>
                {@render children()}
            </LocalHeaderRow>
        {/if}
    </nav>
</div>
