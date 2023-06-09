<script lang="ts">
    import Fa from "svelte-fa";
    import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

    import { clickOutside } from "$lib/client/clickOutside";
    export let user: { avatar: string; name: string };

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
        class:menu-visible={menu}
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
        @apply flex gap-2 items-center;
        @apply h-full w-40 text-left p-1;
        @apply hover:bg-primary-200 transition-colors rounded-lg;

        &, &.menu-visible {
            &:focus, &:hover {
                @apply bg-primary-200;
            }
        }

        &:focus {
            @apply ring-1 ring-inset ring-primary-50;
            @apply border-transparent;
            outline: none;
        }

        &.menu-visible {
            @apply bg-primary-400 rounded-b-none;
        }
    }

    img {
        @apply block rounded-full max-h-full;
    }

    span {
        @apply block;
        &.username {
            @apply whitespace-nowrap text-ellipsis overflow-hidden;
            @apply font-semibold text-sm/none;
        }
    }

    nav {
        display: none;
        @apply bg-primary-400 rounded-b-lg p-1;
        &.visible {
            display: block;
        }
    }

    a {
        @apply flex justify-between items-center;
        --link-theme: theme(colors.gray.100);
        --link-hover: theme(colors.primary.400);
        &.logout {
            --link-theme: theme(colors.strawberry.300);
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
