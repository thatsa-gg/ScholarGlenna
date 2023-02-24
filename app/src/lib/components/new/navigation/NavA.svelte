<script lang="ts">
    import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
    import { internal } from '$lib/client/InternalLink'
    import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
    import Fa from 'svelte-fa'

    export let href: string
    export let icon: IconDefinition | null = null
    export let color: string | null = null
    export let flip: 'horizontal' | 'vertical' | 'both' | null = null
</script>

<style lang="scss">
    a {
        --tag-color: var(--text-subdued);

        text-decoration: none;
        margin-bottom: 4px;
        margin-left: 1.25em;
        padding: 0.25em;

        display: grid;
        grid-template: "icon text tag" 1fr / 24px auto 24px;
        align-items: center;
        transition: var(--transition-font);

        &:hover {
            --tag-color: var(--text);

            font-weight: bold;
        }
    }

    div {
        display: grid;
        &>:global(*:first-child) {
            grid-area: icon;
            max-width: 1.25em;
            align-content: center;
            justify-content: center;
        }
    }

    span {
        display: grid;
        grid-area: text;
    }

    span + :global(*) {
        display: grid;
        grid-area: tag;
    }
</style>

<a {href} use:internal>
    <div aria-hidden>
        {#if icon}
            <Fa {icon} {color} {flip} fw />
        {/if}
    </div>
    <span><slot /></span>
    <Fa icon={faArrowRight} aria-hidden color='var(--tag-color)' />
</a>
