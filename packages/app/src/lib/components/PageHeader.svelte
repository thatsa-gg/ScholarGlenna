<script lang="ts">
    import { session } from '$app/stores'
</script>

<header>
    <a href="/">root</a>
    <!-- TODO logo -->
    <nav>
        <!-- TODO nav -->
        <!-- TODO help -->
    </nav>
    {#if $session.user}
        <!-- TODO user dropdown -->
    {:else}
        <!-- TODO login -->
    {/if}
</header>
