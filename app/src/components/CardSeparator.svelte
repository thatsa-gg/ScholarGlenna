<script lang="ts">
    import type { Snippet } from "svelte"
    let { children }: { children: Snippet } = $props()
</script>

<div class="flex flex-row items-center justify-center gap-4">
    <div aria-hidden class="block w-16 h-[1px] bg-primary-200"></div>
    <span class="block text-sm text-primary-200">
        {@render children()}
    </span>
    <div aria-hidden class="block w-16 h-[1px] bg-primary-200"></div>
</div>
