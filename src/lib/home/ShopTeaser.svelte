<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import type { ProductGroup } from '$lib/shop/types';

	interface Props {
		groups: ProductGroup[];
	}
	let { groups }: Props = $props();
</script>

{#if groups.length > 0}
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
