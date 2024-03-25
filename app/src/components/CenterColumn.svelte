<script lang="ts">
    import type { Snippet } from "svelte"
    let { children }: { children: Snippet } = $props()
</script>

<main class="flex flex-col gap-4 px-2 sm:mx-6 lg:mx-auto max-w-[960px]">
    {@render children()}
</main>
