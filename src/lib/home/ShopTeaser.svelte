<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import type { ProductGroup } from '$lib/shop/types';
	import { reveal } from '$lib/motion/reveal';

	interface Props {
		groups: ProductGroup[];
	}
	let { groups }: Props = $props();
</script>

{#if groups.length > 0}
	<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14" use:reveal>
		<div class="flex items-end justify-between">
			<SectionHeading label="Shop" title="Rep the brand" />
			<Button href={resolve('/shop')} label="View all →" variant="outline" />
		</div>
		<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each groups as group (group.slug)}
				<ProductCard {group} />
			{/each}
		</div>
	</section>
{/if}
