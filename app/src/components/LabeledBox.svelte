<script lang="ts">
    export let label: string
    export let contentClass: string | undefined = undefined
</script>

<div class="grid grid-rows-1 col-span-2 grid-cols-subgrid sm:inline-flex items-center text-sm/7 border-2 border-primary-400 rounded-lg bg-primary-950">
    <span class="px-2 bg-primary-400 text-white rounded-l-md">{label}</span>
    <span class="px-2 flex flex-row gap-2 justify-self-center {contentClass}"><slot /></span>
</div>
