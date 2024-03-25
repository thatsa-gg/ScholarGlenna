<script lang="ts">
    import {
        type IconifyIcon,
        type IconifyIconCustomisations,
        iconToSVG,
        iconToHTML,
        replaceIDs,
    } from "@iconify/utils"
    const {
        icon,
        class: classes,
        ...iconOptions
    }: {
        icon: IconifyIcon
        class?: string
    } & Partial<IconifyIconCustomisations> = $props()

    const renderData = iconToSVG(icon, { ...iconOptions })
    const partialClass: { class?: string } = classes ? { class: classes } : {}
    const svg = iconToHTML(replaceIDs(renderData.body), {
        ...renderData.attributes,
        ...partialClass,
    })
</script>

{@html svg}
