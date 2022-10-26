<script lang="ts">
    import Fa from 'svelte-fa'
    import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'

    export let fixed: boolean = false
    let expanded = fixed
</script>

<details {...$$restProps} bind:open={expanded}>
    <summary aria-hidden={fixed || null}>
        <Fa icon={expanded ? faCaretUp : faCaretDown} aria-hidden />
        {#if expanded}
            Hide other teams
        {:else}
            Show other teams
        {/if}
    </summary>
    <slot />
</details>

<style lang="scss">
    summary {
        text-align: center;
        cursor: pointer;
        user-select: none;
        color: var(--text-subdued);
        transition: var(--transition-color);

        &:hover {
            color: var(--text);
        }

        &::marker {
            content: '';
        }

        &[aria-hidden]{
            display: none;
        }
    }
</style>
