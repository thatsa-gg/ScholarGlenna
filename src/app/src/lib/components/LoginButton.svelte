<script lang="ts">
    import Fa from 'svelte-fa'
    import { faDiscord } from '@fortawesome/free-brands-svg-icons'
</script>

<style lang="postcss">
    a {
        display: flex;
        align-items: center;
        > * {
            display: block;
        }
    }
</style>

<a
    href="/api/login"
    title="Discord OAuth2 Login"
    class="rounded-full bg-blueberry p-2 m-2">
    <Fa icon={faDiscord} size="1.5x" />
    <span class="mx-2">Login with Discord</span>
</a>
