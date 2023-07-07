<script lang="ts">
    export let href: string
    export let active: boolean = false
</script>

<li class:active>
    <a {href}>
        <span class="leader"><slot name="leader" /></span>
        <span><slot /></span>
    </a>
</li>

<style lang="postcss">
    a {
        @apply flex flex-row;
        @apply no-underline px-xl py-sm rounded-md items-center relative;
        @apply hover:bg-primary-500;
        gap: 0.5rem;
        line-height: 30px;
    }

    a::before {
        @apply h-full w-full absolute;
        content: "";
        min-height: 3rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    li {
        @apply flex items-center h-full;

        &.active {
            @apply relative;

            &::after {
                @apply h-0.5 w-full absolute bg-blueberry-600 left-0 bottom-0;
                content: "";
            }
        }
    }

    span.leader {
        @apply text-primary-100;
    }
</style>
