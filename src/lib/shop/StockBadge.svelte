<script lang="ts">
	import { stockStatus } from './format';

	interface Props {
		stock: number;
		restocking?: boolean;
	}
	let { stock, restocking = false }: Props = $props();

	const status = $derived(stockStatus(stock, restocking));
	const tone = $derived(
		status.comingSoon
			? 'bg-highlight-deep/15 text-highlight-deep'
			: status.soldOut
				? 'bg-surface-sunken text-fg-muted'
				: status.low
					? 'bg-highlight/15 text-highlight'
					: 'bg-trim/12 text-trim'
	);
</script>

<span class="inline-block rounded-full px-3 py-1 text-xs font-semibold {tone}">
	{status.label}
</span>
