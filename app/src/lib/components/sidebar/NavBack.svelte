<script lang="ts">
    import NavItem from './NavItem.svelte'
    import { faTurnUp } from '@fortawesome/free-solid-svg-icons'

    export let url: string
    export let name: string
</script>

<NavItem href={url} icon={faTurnUp} flip='horizontal'>{name}</NavItem>
