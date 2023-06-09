<main>
    <slot />
</main>

<style lang="postcss">
    main {
        grid-area: content;
        display: grid;
        grid-template:
            "branding info" 10rem
            "branding nav" min-content
            "actions content" auto
            / 12rem auto;
        gap: 0.5rem;
        /* TODO: no padding on banner */
        /* TODO: get rid of the weird position-relative */
        @apply bg-primary-600 shadow-md justify-self-center w-md h-min;
        @apply md:w-sm;
        @apply sm:w-full;
        @apply transition-width ease-linear;
    }
</style>
