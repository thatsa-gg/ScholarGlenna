<script lang="ts">
    import LoginButton from '$lib/components/LoginButton.svelte'
    export let user: LocalProfile
    export let guilds: any[]
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
        <img alt="{user.displayName} avatar" src="https://cdn.discordapp.com/avatars/{user.snowflake}/{user.avatar}.png">
        <h1>{user.displayName}</h1>
        <h2>Your guilds:</h2>
        <ul>
            {#each guilds as guild}
                <li><a href="/guild/{guild.alias}">{guild.name}</a></li>
            {/each}
        </ul>
        TODO guilds
        TODO teams
        <a title="Sign out" href="/api/logout">Sign Out</a>
    {/if}
</div>
<footer></footer>
