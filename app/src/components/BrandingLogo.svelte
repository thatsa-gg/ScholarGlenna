<script lang="ts">
    import type { Size } from "$lib/client/size"
    let { size = "32", id }: {
        size: Size<32 | 64 | 128 | 256 | 512>
        id?: string
    } = $props()
</script>

<img
    {id}
    alt="/gg"
    width={size}
    height={size}
    src={`/images/icon-${size}.png`}
    aria-hidden="true"
/>
