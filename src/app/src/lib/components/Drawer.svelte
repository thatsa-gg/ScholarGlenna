<script lang="ts" context="module">
    let scrollbarWidth: number | null = null
</script>
<script lang="ts">
    import { onMount } from 'svelte';
    import { beforeNavigate } from '$app/navigation';
    import { clickOutside } from "$lib/client/clickOutside";

    export let id: string
    export let visible: boolean = false
    export let position: 'fixed' | 'absolute' = 'fixed'
    export let placement: 'left' | 'right' | 'top' | 'bottom' = 'left'
    export let offset: string = {
        'left': 'inset-y-0 left-0',
        'right': 'inset-y-0 right-0',
        'top': 'inset-x-0 top-0',
        'bottom': 'inset-x-0 bottom-0',
    }[placement]
    export let width: `w-${string}` = "w-80"
    export let height: `h-${string}` = "h-full"

    let classes: string
    export { classes as class }
    export let backdropClass: string = "bg-black bg-opacity-80"
    export let animate: boolean = false

    export function open(){
        visible = true
    }

    export function close(){
        visible = false
    }


    export let preventScroll: boolean = true
    let body: HTMLElement | null = null
    onMount(() => preventScroll && (body = document.body))
    $: {
        if(preventScroll && body !== null){
            // calculated once for all drawers
            if(null === scrollbarWidth){
                const div = document.createElement("div")
                div.style.visibility = 'hidden'
                div.style.overflow = 'scroll'
                document.body.appendChild(div)

                const inner = document.createElement("div")
                div.appendChild(inner)

                scrollbarWidth = div.offsetWidth - inner.offsetWidth
                div.parentNode?.removeChild(div)
            }

            // prevent the body from scrolling and padding to make up
            // for the lost width.
            if(visible){
                body.style.paddingRight = `${scrollbarWidth}px`;
                body.style.overflow = "hidden";
            } else {
                body.style.paddingRight = "";
                body.style.overflow = "";
            }
        }
    }

    beforeNavigate(() => visible = false)
</script>

{#if visible}
    <div
        role="presentation"
        class={[ backdropClass, "fixed top-0 left-0 z-50 w-full h-full" ].filter(a => a).join(" ")}
        on:click={() => visible = false}
    />
    <div
        use:clickOutside on:clickOutside={close}
        {id}
        {...$$restProps}
        class={[
            classes,
            width,
            height,
            position,
            offset,
            animate && {
                'left': 'drawer-fly-in-left',
                'right': 'drawer-fly-in-right',
                'top': 'drawer-fly-in-up',
                'bottom': 'drawer-fly-in-down',
            }[placement],
        ].filter(a => a).join(" ")}
        aria-controls={id}
        aria-labelledby={id}
    >
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
    @keyframes drawer-fly-in-up {
        from { transform: translateY(100%); }
    }
    @keyframes drawer-fly-in-down {
        from { transform: translateY(-100%); }
    }
    @media (prefers-reduced-motion: no-preference) {
        .drawer-fly-in-left {
            animation: drawer-fly-in-left 0.25s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running;
        }
        .drawer-fly-in-right {
            animation: drawer-fly-in-right 0.25s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running;
        }
        .drawer-fly-in-up {
            animation: drawer-fly-in-up 0.25s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running;
        }
        .drawer-fly-in-down {
            animation: drawer-fly-in-down 0.25s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running;
        }
    }
</style>
