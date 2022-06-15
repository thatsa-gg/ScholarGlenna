<script lang="ts" context="module">
    import { session } from '$app/stores'
</script>
<script lang="ts">
    import LoginButton from '$lib/components/LoginButton.svelte'

    let user = $session.user
</script>

<header>
    <!-- TODO logo -->
    <nav>
        <!-- TODO nav -->
        <!-- TODO help -->
    </nav>
    <!-- TODO login/user dropdown -->
</header>
<div class="content-wrapper">
    {#if !user}
        <main>
            <h1>TODO title</h1>
            <p><span>thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
            <!-- TODO marketing blurb and features -->
        </main>
        <div class="login-box">
            <LoginButton />
        </div>
    {:else}
        <img alt="{user.username}#{user.discriminator} avatar" src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png">
        <h1>{user.username}#{user.discriminator}</h1>
        <a title="Sign out" href="/api/logout">Sign Out</a>
    {/if}
</div>
<footer></footer>
