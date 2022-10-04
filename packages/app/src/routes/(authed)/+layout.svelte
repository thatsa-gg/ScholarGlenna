<script lang="ts">
    import type { LayoutServerData } from "./$types"
    export let data: LayoutServerData

    import LogOutButton from '$lib/components/buttons/LogOutButton.svelte'
    // TODO
</script>

<style lang="scss">
    #main-grid {
        width: 100%;
        height: 100%;
        display: grid;
        grid: 60px auto / 300px auto;
        grid-template-areas: "a a" "b c";
    }
    #title {
        grid-area: a;
        background: var(--primary);
        color: var(--text);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        img {
            display: inline-block;
        }
        &>* {
            display: flex;
        }
    }
    #sidebar {
        grid-area: b;
        background: purple;
    }
    #main-content {
        grid-area: c;
        padding: 1rem 4rem;
    }
</style>

<div id="main-grid">
    <nav id="title">
        <a href="/-/dashboard">thatsa/gg</a>
        <div>
            <img alt="{data.user.displayName}" src="https://cdn.discordapp.com/{data.user.avatar}.png"/>
            <span>{data.user.username}#{data.user.discriminator}</span>
            <LogOutButton />
        </div>
    </nav>
    <div id="sidebar">&nbsp;</div>
    <main id="main-content"><slot /></main>
</div>
