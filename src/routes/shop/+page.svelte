<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import { toShopCards } from '$lib/shop/shop-cards';
	import { resolve } from '$app/paths';
	import Seo from '$lib/seo/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="Shop — Missy Midwest"
	description="Official Missy Midwest merch — hats, tees, and more."
/>

<Section label="Shop" title={data.shopEnabled ? 'Rep the brand' : 'Coming soon'} reveal={false}>
	{#if !data.shopEnabled}
		<p class="opacity-85">
			Official Missy Midwest merch — hats, tees &amp; more — is dropping soon. Catch a show or say
			hi in the meantime.
		</p>
		<div class="mt-6 flex gap-4">
			<Button href={resolve('/shows')} label="See shows" variant="fill" />
			<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
		</div>
	{:else if data.loadError}
		<p class="opacity-85">The shop is temporarily unavailable. Please check back soon.</p>
		<div class="mt-6">
			<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
		</div>
	{:else if data.groups.length === 0}
		<p class="opacity-85">Merch is dropping soon. In the meantime, catch a show or say hi.</p>
		<div class="mt-6 flex gap-4">
			<Button href={resolve('/shows')} label="See shows" variant="fill" />
			<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
		</div>
	{:else}
		<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each toShopCards(data.groups) as card (card.id)}
				<ProductCard {card} />
			{/each}
		</div>
	{/if}
</Section>
