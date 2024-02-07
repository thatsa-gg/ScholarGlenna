<script lang="ts">
    import { page } from "$app/stores"
    import { ClientAppUrl } from "$lib/url"
    import ButtonLink from "./ButtonLink.svelte"
    import Icon from "@iconify/svelte"
    import IconDiscord from "@iconify-icons/bi/discord"

    $: href = ClientAppUrl.login($page.url)
</script>

<ButtonLink {href}
    label="Log in with Discord OAuth2"
    class="transition-colors duration-100 bg-primary-500 hover:bg-blueberry"
>
    <span class="flex gap-2 items-center px-1">
        <Icon icon={IconDiscord} />
        <span><slot>Log In</slot></span>
    </span>
</ButtonLink>
