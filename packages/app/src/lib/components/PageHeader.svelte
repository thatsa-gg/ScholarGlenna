<script lang="ts">
    import LogOutButton from "./new/LogOutButton.svelte";
    import TitleLink from "./TitleLink.svelte";

    export let user: {
        displayName: string
        avatar: string
        username: string
        discriminator: string
    }
</script>

<style lang="scss">
    header {
        grid-area: header;
        grid-column-start: 0;
        align-items: center;
        z-index: var(--level-header);
        background: var(--secondary-background);
        box-shadow: var(--shadow-border);
        color: var(--text);
        display: flex;
        flex-direction: row;

        &>* {
            display: block;
        }
        a {
            padding: 4px;
        }
    }

    a.title {
        width: var(--width-sidebar);
    }

    a.profile-link {
        display: flex;
        align-items: center;
        img {
            height: 100%;
            display: inline-block;
            border: 2px solid hsla(0, 100%, 100%, 60%);
            border-radius: 50%;
            filter: grayscale(60%);
            transition: var(--transition-all);
        }
        &:hover img {
            filter: none;
            border-color: hsla(0, 100%, 100%, 100%);
        }
    }

    div.flex-right {
        margin-left: auto;
        display: flex;
        height: 100%;
    }
</style>

<header {...$$restProps}>
    <a href="/-/guilds">Guilds</a>
    <a href="/-/teams">Teams</a>
    <div class="flex-right">
        <a href="/-/profile" class="profile-link">
            <img alt={user.displayName} src="https://cdn.discordapp.com/{user.avatar}.png" />
            <span>{user.username}#{user.discriminator}</span>
        </a>
        <LogOutButton />
    </div>
</header>
