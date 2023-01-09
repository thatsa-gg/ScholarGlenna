<script lang="ts">
    import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
    import Fa from "svelte-fa"
    import NavLink from './__NavLink.svelte'

    export let href: string
    export let icon: IconDefinition | undefined = undefined
    export let tag: IconDefinition | undefined = undefined
    export let color: string | undefined = undefined
    export let flip: 'horizontal' | 'vertical' | 'both' | undefined = undefined
</script>

<NavLink href={href}>
    <svelte:fragment slot="icon">
        {#if icon}
            <Fa icon={icon} color={color} {flip} fw aria-hidden />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="text"><slot /></svelte:fragment>
    <svelte:fragment slot="tag">
        {#if tag}
            <Fa icon={tag} aria-hidden color='var(--tag-color)' />
        {/if}
    </svelte:fragment>
</NavLink>
