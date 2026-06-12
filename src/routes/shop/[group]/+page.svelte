<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import VariantSelector from '$lib/shop/VariantSelector.svelte';
	import StockBadge from '$lib/shop/StockBadge.svelte';
	import Button from '$lib/components/Button.svelte';
	import { formatPrice, stockStatus } from '$lib/shop/format';
	import { pickInitialVariant, variantSlug } from '$lib/shop/shop-cards';
	import { cart } from '$lib/shop/cart.svelte';
	import type { Variant } from '$lib/shop/types';
	import Seo from '$lib/seo/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Writable derived: seeds from the ?variant= slug (the clicked card, even if
	// sold out) on load and real navigation, else the first in-stock variant. The
	// toggle overrides it directly — replaceState doesn't feed back into page.url
	// reactively, so the local override is what drives the UI.
	let selected = $derived<Variant>(
		pickInitialVariant(data.group, page.url.searchParams.get('variant'))
	);
	const soldOut = $derived(stockStatus(selected.stock).soldOut);

	// Update the view immediately, then mirror the choice into the URL without
	// adding history (Back → /shop, not through every color) so it stays
	// shareable/refresh-safe.
	function selectVariant(variant: Variant) {
		selected = variant;
		const url = new URL(page.url);
		url.searchParams.set('variant', variantSlug(variant.label));
		// Reuses the already-resolved current URL, only swapping the query — no route to resolve().
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(url, {});
	}

	function addToCart() {
		cart.add(selected, data.group);
		cart.open = true;
	}
</script>

<Seo
	title={`${data.group.name} — Missy Midwest`}
	description={data.group.description || `Shop the ${data.group.name} from Missy Midwest.`}
	image={data.group.image}
/>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<a
		href={resolve('/shop')}
		class="text-missy-classic-lavender/80 hover:text-missy-blush text-sm tracking-wide transition"
	>
		← Back to shop
	</a>

	<div class="mt-6 grid items-start gap-8 md:grid-cols-2 lg:gap-12">
		<div class="panel-glass aspect-square overflow-hidden">
			{#if selected.image}
				<img src={selected.image} alt={data.group.name} class="h-full w-full object-cover" />
			{/if}
		</div>

		<div class="flex flex-col">
			<h1 class="text-4xl md:text-5xl">{data.group.name}</h1>
			<p class="text-missy-classic-lavender mt-2 text-2xl">{formatPrice(selected.price)}</p>
			<div class="mt-4"><StockBadge stock={selected.stock} /></div>

			{#if data.group.description}
				<p class="text-missy-classic-lavender/90 mt-6 max-w-md leading-relaxed">
					{data.group.description}
				</p>
			{/if}

			{#if data.group.variants.length > 1}
				<div class="mt-8">
					<div class="label-eyebrow mb-3">
						{data.group.variantType === 'size' ? 'Size' : 'Color'}
					</div>
					<VariantSelector
						variants={data.group.variants}
						variantType={data.group.variantType}
						{selected}
						onSelect={selectVariant}
					/>
				</div>
			{/if}

			<div class="mt-8">
				<Button
					label={soldOut ? 'Sold out' : 'Add to cart'}
					variant="fill"
					disabled={soldOut}
					onclick={addToCart}
				/>
			</div>
		</div>
	</div>
</section>
