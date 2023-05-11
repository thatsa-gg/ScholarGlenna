<script lang="ts">
    import LoginButton from "$lib/components/LoginButton.svelte"
</script>

<div>
    <LoginButton />
</div>

<slot />

<style lang="postcss">
    div {
        display: flex;
        justify-content: flex-end;
        grid-row: header;
        grid-column: header-start / user-end;

        @apply bg-primary-600 shadow-sm z-header sticky top-0;
    }
</style>
