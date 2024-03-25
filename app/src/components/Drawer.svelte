<script lang="ts" context="module">
    export function drawerState(){
        let visible = $state(false)
        return {
            get visible(){ return visible },
            open(){ visible = true },
            close(){ visible = false },
        }
    }

    export type DrawerState = ReturnType<typeof drawerState>
</script>

<script lang="ts">
    import type { Snippet } from "svelte"
    let {
        class: classes = "",
        id,
        placement = "left",
        state,
        children,
    }: {
        class?: string
        id: string
        placement?: "left" | "right"
        state: DrawerState
        children: Snippet
    } = $props()
    let sided = {
        "left": "inset-y-0 left-0 drawer-fly-in-left border-l rounded-r-lg",
        "right": "inset-y-0 right-0 drawer-fly-in-right border-r rounded-l-lg",
    }[placement]
</script>

{#if state.visible}
    <div role="presentation"
         class="bg-black bg-opacity-80 fixed top-0 left-0 z-50 w-full h-full"
         on:click={() => state.close()}/>
    <div {id} class="
        {classes} {sided}
        fixed w-80 h-full z-50 overflow-hidden
        flex flex-col
        bg-primary-900 border-primary-500
    " aria-controls={id} aria-labelledby={id}>
        {@render children()}
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
