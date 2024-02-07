<script lang="ts">
    export let id: string
    export let placement: "left" | "right" = "left"

    let sided = {
        "left": "inset-y-0 left-0 drawer-fly-in-left border-l rounded-r-lg",
        "right": "inset-y-0 right-0 drawer-fly-in-right border-r rounded-l-lg",
    }[placement]
    let visible: boolean = false
    export function setState(open: boolean){
        visible = open
    }

    let classes: string = ""
    export { classes as class }
</script>

{#if visible}
    <div role="presentation"
         class="bg-black bg-opacity-80 fixed top-0 left-0 z-50 w-full h-full"
         on:click={() => visible = false}/>
    <div {id} class="
        {classes} {sided}
        fixed w-80 h-full z-50 overflow-hidden
        flex flex-col
        bg-primary-900 border-primary-500
    " aria-controls={id} aria-labelledby={id}>
        <slot hidden={!visible} />
    </div>
{/if}

<style lang="postcss">
    @keyframes drawer-fly-in-left {
        from { transform: translateX(-100%); }
    }
    @keyframes drawer-fly-in-right {
        from { transform: translateX(100%); }
    }
    @media (prefers-reduced-motion: no-preference) {
        .drawer-fly-in-left {
            animation: drawer-fly-in-left 0.25s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running;
        }
        .drawer-fly-in-right {
            animation: drawer-fly-in-right 0.25s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running;
        }
    }
</style>
