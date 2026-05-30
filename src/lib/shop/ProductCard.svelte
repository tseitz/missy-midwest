<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ProductGroup } from './types';
	import { formatPrice } from './format';

	interface Props {
		group: ProductGroup;
	}
	let { group }: Props = $props();

	const soldOut = $derived(group.variants.every((variant) => variant.stock <= 0));
	const multi = $derived(group.variants.length > 1);
</script>

<a
	href={resolve('/shop/[group]', { group: group.slug })}
	class="border-missy-classic-lavender/12 group block overflow-hidden rounded-2xl border bg-[#1d1830]"
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
	<div class="px-4 py-4">
		<div class="text-sm font-semibold">{group.name}</div>
		<div class="text-missy-classic-lavender text-sm">
			{multi ? 'from ' : ''}{formatPrice(group.fromPrice)}
		</div>
	</div>
</a>
