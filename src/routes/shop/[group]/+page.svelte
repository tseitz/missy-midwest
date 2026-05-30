<script lang="ts">
	import VariantSelector from '$lib/shop/VariantSelector.svelte';
	import StockBadge from '$lib/shop/StockBadge.svelte';
	import { formatPrice } from '$lib/shop/format';
	import type { Variant } from '$lib/shop/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Writable derived: defaults to the first variant and resets on navigation
	// to a different group, while still allowing the toggle to override it.
	let selected = $derived<Variant>(data.group.variants[0]);
</script>

<svelte:head>
	<title>{data.group.name} — Missy Midwest</title>
</svelte:head>

<section class="grid w-full max-w-screen-2xl gap-10 px-8 py-20 md:grid-cols-2 md:px-14">
	<div class="bg-missy-deep-purple/40 aspect-square overflow-hidden rounded-2xl">
		{#if selected.image}
			<img src={selected.image} alt={data.group.name} class="h-full w-full object-cover" />
		{/if}
	</div>

	<div>
		<h1 class="text-4xl md:text-5xl">{data.group.name}</h1>
		<p class="text-missy-classic-lavender mt-3 text-2xl">{formatPrice(selected.price)}</p>
		<div class="mt-3"><StockBadge stock={selected.stock} /></div>

		{#if data.group.description}
			<p class="mt-6 max-w-md opacity-85">{data.group.description}</p>
		{/if}

		{#if data.group.variants.length > 1}
			<div class="mt-8">
				<div class="label-eyebrow mb-3">{data.group.variantType === 'size' ? 'Size' : 'Color'}</div>
				<VariantSelector
					variants={data.group.variants}
					variantType={data.group.variantType}
					{selected}
					onSelect={(variant) => (selected = variant)}
				/>
			</div>
		{/if}
	</div>
</section>
