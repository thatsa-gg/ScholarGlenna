<script lang="ts">
    import Fa from 'svelte-fa'
    import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'

    export let fixed: boolean = false
    let open = fixed
</script>

<details bind:open {...$$restProps}>
    <summary aria-hidden={fixed || null}>
        <Fa icon={open ? faCaretUp : faCaretDown} aria-hidden />
        {#if open}
            <slot name="close">Hide</slot>
        {:else}
            <slot name="open">Show</slot>
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
