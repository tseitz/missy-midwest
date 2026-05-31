<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ProductGroup } from './types';
	import { formatPrice } from './format';

	interface Props {
		group: ProductGroup;
	}
	let { group }: Props = $props();

	const soldOut = $derived(group.variants.every((variant) => variant.stock <= 0));
	const priceVaries = $derived(new Set(group.variants.map((variant) => variant.price)).size > 1);
</script>

<a
	href={resolve('/shop/[group]', { group: group.slug })}
	class="group panel-glass glow-hover block overflow-hidden"
>
	<div class="bg-missy-deep-purple/40 relative aspect-square">
		{#if group.image}
			<img src={group.image} alt={group.name} class="h-full w-full object-cover" />
		{/if}
		{#if soldOut}
			<span
				class="absolute top-3 left-3 rounded-full bg-zinc-900/80 px-3 py-1 text-xs text-zinc-200"
			>
				Sold out
			</span>
		{/if}
	</div>
	<div class="px-5 pt-4 pb-5">
		<h3 class="text-lg leading-snug">{group.name}</h3>
		<p class="text-missy-blush mt-1.5 text-base font-semibold">
			{priceVaries ? 'from ' : ''}{formatPrice(group.fromPrice)}
		</p>
	</div>
</a>
