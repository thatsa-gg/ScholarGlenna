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
            / min-content auto;
        gap: 0.5rem;
        /* TODO: no padding on banner */
        /* TODO: get rid of the weird position-relative */
        @apply w-min justify-self-center;
        /*@apply bg-primary-600 shadow-md justify-self-center w-md h-min;*/
        /*@apply w-md md:w-sm sm:w-full transition-width ease-linear;*/
    }
</style>
