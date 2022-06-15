<script lang="ts">
    import Fa from 'svelte-fa'
    import { faDiscord } from '@fortawesome/free-brands-svg-icons'
</script>
<div>
    <a
        href="/api/login"
        title="Discord OAuth2 Login">
        <Fa icon={faDiscord} />
        Sign in with Discord
    </a>
</div>
