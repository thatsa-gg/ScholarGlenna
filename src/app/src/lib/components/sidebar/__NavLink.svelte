<script lang="ts">
    export let href: string
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
            font-weight: bold;
            --tag-color: var(--text);
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

<a href="{href}">
    <div><slot name="icon"></slot></div>
    <span><slot name="text"></slot></span>
    <slot name="tag"></slot>
</a>
