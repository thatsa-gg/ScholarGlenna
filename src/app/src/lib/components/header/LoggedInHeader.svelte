<script lang="ts">
    import UserMenu from '$lib/components/header/UserMenu.svelte'

    export let user: {
        avatar: string
        name: string
        discriminator: string
    };
</script>

<nav class="bg-primary-400 [grid-row:header] [grid-column:header-start/tools-end] shadow-sm">
    search
    <!-- TODO: search -->
</nav>
<div class="bg-primary-400 [grid-area:user] shadow-sm content-center p-1">
    <UserMenu user={user} />
</div>
