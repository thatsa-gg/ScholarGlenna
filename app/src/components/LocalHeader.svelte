<script lang="ts">
    // Components
    import LocalHeaderRow from "./LocalHeaderRow.svelte"

    // Properties
    export let label: string | undefined = undefined
    export let multirow: boolean = false
</script>

<div class="flex flex-row gap-2 pl-4 pr-16 sm:pr-4">
    <nav class="flex flex-row flex-wrap justify-start w-full gap-y-1" aria-label={label}>
        {#if multirow}
            <slot />
        {:else}
            <LocalHeaderRow>
                <slot />
            </LocalHeaderRow>
        {/if}
    </nav>
</div>
