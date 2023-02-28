<script lang="ts">
    import TitleBranding from './TitleBranding.svelte'
    import NavigationFooter, { type UserInfo } from './navigation/NavigationFooter.svelte'

    export let name: string
    export let user: UserInfo
</script>

<nav>
    <TitleBranding href={ name } />
    <slot />
    <NavigationFooter { user }/>
</nav>

<style lang="scss">
    nav {
        grid-area: sidebar;
        display: flex;
        z-index: var(--level-sidebar);
        flex-direction: column;
        height: 100vh;
        background-color: var(--secondary-background);
        box-shadow: var(--shadow-border);
    }
</style>
