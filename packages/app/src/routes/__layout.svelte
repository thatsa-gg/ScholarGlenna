<script lang="ts">
    import PageHeader from '$lib/components/PageHeader.svelte'
    import PageNavigator from '$lib/components/PageNavigator.svelte'
    import PageFooter from '$lib/components/PageFooter.svelte'
    import '../scss/app.scss'
</script>

<PageHeader />
<PageNavigator />
<div class="body-wrapper">
    <slot></slot>
</div>
<PageFooter />
