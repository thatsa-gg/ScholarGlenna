<script lang="ts">
    import { page } from '$app/stores'
    export let href: string
    $: active = $page.url.pathname === href
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
    li {
        @apply relative my-0.5;
    }

    a {
        @apply grid no-underline rounded-md p-sm items-center;
        grid-template: "leader content trailer" min-content / minmax(1.5rem, min-content) minmax(0, auto) min-content;
        gap: 0.5rem;

        @apply hover:bg-primary-500;

        &.active {
            @apply bg-primary-700 hover:bg-primary-500;

            &::before {
                @apply bg-blueberry-500 rounded h-6 w-0.5 absolute -left-2;
                content: "";
            }
        }
    }

    span.leader {
        grid-area: leader;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    span.content {
        grid-area: content;
    }
</style>
