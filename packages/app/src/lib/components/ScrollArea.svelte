<div class="wrapper">
    <div class="content">
        <slot />
    </div>
</div>

<style lang="scss">
    .wrapper {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        height: 0;
    }
    .content {
        flex: 1 1 auto;
        height: 0;
        overflow-y: scroll;
        padding-bottom: 1em;
    }
</style>
