<script lang="ts">
    import Fa from 'svelte-fa'
    import NavLink from './__NavLink.svelte'

    import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

    export let url: string
    export let name: string
    //export let color: string | undefined = undefined
    export let icon: string | undefined = undefined
</script>

<NavLink href={url}>
    <svelte:fragment slot="icon">
        {#if icon}
            <img alt={name} src={icon} width="24" aria-hidden />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="text">{name}</svelte:fragment>
    <svelte:fragment slot="tag">
        <Fa icon={faArrowRight} aria-hidden color='var(--tag-color)' />
    </svelte:fragment>
</NavLink>
