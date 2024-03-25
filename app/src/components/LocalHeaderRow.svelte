<script lang="ts">
    import type { Snippet } from "svelte"
    let { children }: { children: Snippet } = $props()
</script>

<ul class="flex flex-row flex-wrap items-center gap-1 flex-shrink-0 justify-between h-8 w-full sm:w-max">
    {@render children()}
</ul>
