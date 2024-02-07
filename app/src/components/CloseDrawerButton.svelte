<script lang="ts">
    import Icon from "@iconify/svelte"
    import IconClose from "@iconify-icons/octicon/x-16"

    import type Drawer from "./Drawer.svelte"
    export let drawer: Drawer
</script>
<button class="transition-colors duration-100
                flex items-center justify-center
                w-8 h-8 rounded-md
                hover:bg-primary-500"
    on:click={() => drawer.setState(false)}>
    <Icon icon={IconClose} class="text-2xl" />
</button>
