<script lang="ts">
    import Icon from "./Icon.svelte"
    import IconClose from "@iconify-icons/octicon/x-16"

    import type { DrawerState } from "./Drawer.svelte"
    let { state }: { state: DrawerState } = $props()
</script>
<button class="transition-colors duration-100
                flex items-center justify-center
                w-8 h-8 rounded-md
                hover:bg-primary-500"
    on:click={() => state.close()}>
    <Icon icon={IconClose} class="text-2xl" />
</button>
