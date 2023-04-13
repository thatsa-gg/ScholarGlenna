<script lang="ts">
    import UserMenu from '$lib/components/header/UserMenu.svelte'

    export let user: {
        avatar: string
        name: string
        discriminator: string
    };
</script>

<nav>
    search
    <!-- TODO: search -->
</nav>
<div>
    <UserMenu user={user} />
</div>

<style lang="postcss">
    nav {
        grid-row: header;
        grid-column: header-start / tools-end;
        @apply bg-primary-400 shadow-sm;
        @apply z-header sticky top-0;
    }

    div {
        grid-area: user;
        @apply bg-primary-400 shadow-sm content-center p-1;
        @apply z-header sticky top-0;
    }
</style>
