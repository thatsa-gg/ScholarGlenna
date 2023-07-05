<script lang="ts">
    import Fa from 'svelte-fa'
    import { faDiscord } from '@fortawesome/free-brands-svg-icons'
    import { page } from '$app/stores'
    import Button from './Button.svelte';
    $: href = `/auth/sso?redirect_uri=${encodeURIComponent($page.url.pathname + $page.url.search)}`
</script>

<Button { href } label="Log in with Discord OAuth2"
    hoverClass="hover:bg-blueberry"
    backgroundClass="bg-primary-500"
    class="transition-colors duration-100"
    spanClass="flex flex-row gap-2 items-center px-1"
>
    <Fa icon={faDiscord} />
    <span>Log In</span>
</Button>
