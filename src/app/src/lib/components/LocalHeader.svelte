<script lang="ts">
    export let label: string
</script>
<div class="flex flex-row gap-2 px-4">
    <nav class="flex flex-row justify-between" aria-label={label}>
        <ul class="flex flex-row items-center">
            <slot />
        </ul>
        <!-- TODO: capture overflowing items and move them to an overflow menu -->
    </nav>
</div>

<style lang="postcss">
    nav {
        min-height: 3rem;
    }
</style>
