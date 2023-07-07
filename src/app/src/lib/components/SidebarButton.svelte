<script lang="ts">
    export let href: string
    let active = false
</script>

<li>
    <a {href} class:active>
        {#if $$slots.leader}
            <span class="leader" aria-hidden="true"><slot name="leader"/></span>
        {/if}
        <span class="content"><slot /></span>
        {#if $$slots.trailer}
            <span class="trailer" aria-hidden="true"><slot name="trailer"/></span>
        {/if}
    </a>
</li>

<style lang="postcss">
    a {
        @apply grid no-underline rounded-md items-center;
        grid-template: "leader content trailer" min-content / minmax(1rem, auto) minmax(0, auto) min-content;
        gap: 0.5rem;

        @apply hover:bg-primary-500;
    }
</style>
