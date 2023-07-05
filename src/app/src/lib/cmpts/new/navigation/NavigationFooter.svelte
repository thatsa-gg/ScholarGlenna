<script lang="ts" context="module">
    export interface UserInfo {
        displayName: string
        avatar: string
        username: string
    }
</script>

<script lang="ts">
    import LogOutButton from '$lib/components/new/LogOutButton.svelte'

    export let user: UserInfo
</script>

<footer>
    <a href="/-/profile">
        <img alt={user.displayName} src={user.avatar} />
        <span>{user.username}</span>
    </a>
    <LogOutButton />
</footer>

<style lang="postcss">
    footer {
        display: flex;
        border-top: 1px solid var(--primary-color);

        padding: 0.5em;
        justify-content: space-between;
    }

    a {
        display: flex;
        align-items: center;

        img {
            display: inline-block;
            height: 100%;
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
</style>
