<script lang="ts">
    import type { Snippet } from "svelte"
    let { children }: { children: Snippet } = $props()
</script>

<div class="area-header flex bg-primary-950 -mx-4 rounded-t-lg px-4 py-2">
    {@render children()}
</div>
