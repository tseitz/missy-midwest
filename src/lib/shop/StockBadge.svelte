<script lang="ts">
	import { stockStatus } from './format';

	interface Props {
		stock: number;
	}
	let { stock }: Props = $props();

	const status = $derived(stockStatus(stock));
</script>

<span
	class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
	class:bg-missy-deep-purple={!status.soldOut}
	class:text-missy-classic-lavender={status.low}
	class:text-violet-200={!status.low && !status.soldOut}
	class:bg-zinc-700={status.soldOut}
	class:text-zinc-300={status.soldOut}
>
	{status.label}
</span>
