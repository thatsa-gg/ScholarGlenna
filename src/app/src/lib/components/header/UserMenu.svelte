<script lang="ts">
    import Fa from "svelte-fa";
    import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

    import { clickOutside } from "$lib/client/clickOutside";
    export let user: { avatar: string; name: string; discriminator: string };

    let avatar: HTMLImageElement | undefined = undefined;
    let menu: boolean = false;
</script>

<div
    class:menu-visible={menu}
    use:clickOutside
    on:clickOutside={() => (menu = false)}
>
    <button
        type="button"
        on:click={() => (menu = !menu)}
        role="menu"
        title="User Management"
        aria-label="User Management"
        aria-owns="user-menu-items"
    >
        <img
            src={user.avatar}
            alt={user.name}
            width={avatar?.height}
            bind:this={avatar}
        />
        <span class="username">{user.name}</span>
        <span class="discriminator">#{user.discriminator}</span>
    </button>

    <nav class:visible={menu} id="user-menu-items">
        <a href="/auth/signout" class="logout" role="menuitem"
            ><span>Log Out</span><Fa
                icon={faRightFromBracket}
                scale="1.25x"
                aria-hidden="true"
            /></a
        >
    </nav>
</div>

<style lang="postcss">
    div {
        @apply h-full rounded-t-lg;
        &.menu-visible {
            @apply bg-primary-600;
        }
    }

    button {
        grid-template:
            "avatar name" 50%
            "avatar discriminator" 50% / max-content auto;
        @apply grid gap-x-2 h-full w-40 text-left p-1;
        @apply hover:bg-primary-700 transition-colors rounded-lg;
        &:focus {
            @apply ring-1 ring-inset ring-primary-950;
            @apply bg-primary-700;
            @apply border-transparent;
            outline: none;
        }
    }

    img {
        grid-area: avatar;
        display: block;
        @apply rounded-full max-h-full;
    }

    span {
        display: block;
        &.username {
            grid-area: name;
            @apply whitespace-nowrap text-ellipsis overflow-hidden;
            @apply font-semibold text-sm/none self-end;
        }
        &.discriminator {
            grid-area: discriminator;
            @apply text-primary-950 text-xs/none self-start;
        }
    }

    nav {
        display: none;
        @apply bg-primary-600 rounded-b-lg p-1;
        &.visible {
            display: block;
        }
    }

    a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        --link-theme: theme(colors.gray.100);
        --link-hover: theme(colors.primary.600);
        &.logout {
            --link-theme: theme(colors.strawberry.700);
            --link-hover: theme(colors.gray.200);
        }

        @apply px-2 py-0.5 transition-colors rounded-lg;
        color: var(--link-theme);
        &:hover {
            color: var(--link-hover);
            background: var(--link-theme);
            @apply font-semibold;
        }
        &:focus {
            @apply ring-1 ring-inset ring-[color:var(--link-theme)];
            @apply border-transparent;
            outline: none;
        }
    }
</style>
