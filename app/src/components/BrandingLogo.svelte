<script lang="ts">
    type StringOrNumber<T extends number> = T | `${T}`
    let { size = "32", id }: {
        size: StringOrNumber<32 | 64 | 128 | 256 | 512>
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
