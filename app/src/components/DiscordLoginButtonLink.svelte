<script lang="ts">
    import type { Snippet } from "svelte"
    import { page } from "$app/stores"
    import { ClientAppUrl } from "$lib/url"
    import ButtonLink from "./ButtonLink.svelte"
    import Icon from "@iconify/svelte"
    import IconDiscord from "@iconify-icons/bi/discord"

    let href = $derived(ClientAppUrl.login($page.url))
    let { children }: { children?: Snippet } = $props()
</script>

<ButtonLink {href}
    label="Log in with Discord OAuth2"
    class="transition-colors duration-100 bg-primary-500 hover:bg-blueberry"
>
    <span class="flex gap-2 items-center px-1">
        <Icon icon={IconDiscord} />
        <span>
            {#if children}
                {@render children()}
            {:else}
                Log In
            {/if}
        </span>
    </span>
</ButtonLink>
