<script lang="ts">
    import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill'
    export let timestamp: number;
    export let duration: string;

    let datetime = new Date(timestamp)
    let title = datetime.toLocaleDateString()
    console.log(datetime)
</script>

<time datetime={datetime.toISOString()} {title}>{datetime} for {duration}</time>
