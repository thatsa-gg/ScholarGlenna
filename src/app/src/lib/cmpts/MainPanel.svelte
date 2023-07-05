<script lang="ts">
    export let title: string
    export let banner: string | null = null
</script>

<style lang="scss">
div.main-panel {
    margin: 1em;
    grid-area: content;
    overflow: hidden;
    max-width: 1024px;
    &>* {
        display: block;
    }
}

img.banner {
    width: 100%;
    height: 240px;
    object-fit: cover;
}

h1 {
    margin: 0;
    padding: 0.5rem 4rem;
}
</style>

<div class="main-panel">
    {#if banner}<img class="banner" src="{banner}" alt="Guild splash." />{/if}
    <h1>{title}</h1>
    <div>
        <slot />
    </div>
</div>
