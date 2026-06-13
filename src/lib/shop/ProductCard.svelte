<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ShopCard } from './shop-cards';
	import { formatPrice } from './format';

	interface Props {
		card: ShopCard;
	}
	let { card }: Props = $props();

	const href = $derived(
		resolve('/shop/[group]', { group: card.slug }) +
			(card.variantSlug ? `?variant=${card.variantSlug}` : '')
	);
</script>

<!-- href is built with resolve() above, plus an optional ?variant= query the rule can't trace -->
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} class="group panel-glass glow-hover block overflow-hidden">
	<div class="bg-missy-deep-purple/40 relative aspect-square">
		{#if card.image}
			<img src={card.image} alt={card.name} class="h-full w-full object-cover" />
		{/if}
		{#if card.soldOut}
			<span
				class="absolute top-3 left-3 rounded-full bg-zinc-900/80 px-3 py-1 text-xs text-zinc-200"
			>
				Sold out
			</span>
		{/if}
	</div>
	<div class="px-5 pt-4 pb-5">
		<h3 class="text-xl leading-snug">{card.name}</h3>
		{#if card.variantLabel}
			<p class="text-missy-classic-lavender/80 mt-0.5 text-sm">{card.variantLabel}</p>
		{/if}
		<p class="text-missy-blush mt-1.5 text-base font-semibold">
			{card.priceVaries ? 'from ' : ''}{formatPrice(card.price)}
		</p>
	</div>
</a>
