<main>
    <slot />
</main>

<style lang="postcss">
    main {
        grid-area: content;
        position: relative;
        /* TODO: no padding on banner */
        /* TODO: get rid of the weird position-relative */
        @apply -top-4 p-6 bg-primary-400 rounded-b-md shadow-md justify-self-center w-md h-min;
        @apply md:w-sm;
        @apply sm:w-full;
        @apply transition-width ease-linear;
    }
</style>
