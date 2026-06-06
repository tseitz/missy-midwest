<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import { SHOP_ENABLED } from '$lib/shop/config';
	import type { ProductGroup } from '$lib/shop/types';

	interface Props {
		groups: ProductGroup[];
	}
	let { groups }: Props = $props();
</script>

{#if !SHOP_ENABLED}
	<Section label="Shop" title="Coming soon">
		<p class="mt-2 max-w-md opacity-85">
			Official Missy Midwest merch — hats, tees &amp; more — is on the way. Dropping soon.
		</p>
		<div class="mt-6">
			<Button href={resolve('/shows')} label="See shows" variant="outline" />
		</div>
	</Section>
{:else if groups.length > 0}
	<Section label="Shop" title="Rep the brand">
		{#snippet action()}
			<Button href={resolve('/shop')} label="View all →" variant="outline" />
		{/snippet}
		<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each groups as group (group.slug)}
				<ProductCard {group} />
			{/each}
		</div>
	</Section>
{/if}
