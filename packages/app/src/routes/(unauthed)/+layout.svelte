<script lang="ts">
    import PageHeader from '$lib/components/PageHeader.svelte'
    import PageNavigator from '$lib/components/PageNavigator.svelte'
    import PageFooter from '$lib/components/PageFooter.svelte'
</script>

<PageHeader />
<PageNavigator />
<div class="body-wrapper">
    <slot />
</div>
<PageFooter />
