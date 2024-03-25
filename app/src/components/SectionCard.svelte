<script lang="ts">
    import type { Snippet } from "svelte"
    let { id, children }: {
        id: string
        children: Snippet
    } = $props()
</script>

<div {id} class="bg-slate-600 h-96 mb-12 scroll-mt-auto-header">
    {@render children()}
</div>
