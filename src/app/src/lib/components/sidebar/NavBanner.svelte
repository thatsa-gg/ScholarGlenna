<script lang="ts">
    export let banner: string
    export let alt: string
    export let width: number | undefined = undefined
    export let height: number | undefined = undefined
</script>
<style lang="scss">
    div {
        display: grid;
        grid-template: "banner" 1fr / 1fr;
        align-items: end;
    }
    img {
        grid-area: banner;
        width: 100%;
        height: auto;
    }
    h1 {
        display: block;
        margin: 0;
        padding: 0.5em 0.25em 0.25em 1.25em;
        font-weight: bold;
        color: var(--text);

        grid-area: banner;
        z-index: 1;
        background: linear-gradient(to top, var(--secondary-background), 60%, transparent);
    }
</style>

<div {...$$restProps}>
    <img src={banner} {alt} {width} {height} />
    <h1>{alt}</h1>
</div>
