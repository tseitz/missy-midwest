<script lang="ts">
	import { stockStatus } from './format';

	interface Props {
		stock: number;
	}
	let { stock }: Props = $props();

	const status = $derived(stockStatus(stock));
	const tone = $derived(
		status.soldOut
			? 'bg-zinc-700 text-zinc-300'
			: status.low
				? 'bg-lake-sunrise/15 text-lake-sunrise'
				: 'bg-missy-classic-lavender/12 text-missy-classic-lavender'
	);
</script>

<span class="inline-block rounded-full px-3 py-1 text-xs font-semibold {tone}">
	{status.label}
</span>
