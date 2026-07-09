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
			? 'bg-lake-summer-blue/15 text-lake-summer-blue'
			: status.soldOut
				? 'bg-zinc-700 text-zinc-300'
				: status.low
					? 'bg-lake-sunrise/15 text-lake-sunrise'
					: 'bg-missy-classic-lavender/12 text-missy-classic-lavender'
	);
</script>

<span class="inline-block rounded-full px-3 py-1 text-xs font-semibold {tone}">
	{status.label}
</span>
