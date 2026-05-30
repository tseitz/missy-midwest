<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	// Phase 2 replaces this static list with featured products from Stripe.
	const featured = [
		{ name: 'Lavender Trucker', price: '$32', grad: 'from-missy-neon-lavender to-missy-blush' },
		{ name: 'Sunset Dad Hat', price: '$30', grad: 'from-missy-deep-purple to-lake-sunrise' },
		{ name: 'Tour Tee', price: '$28', grad: 'from-missy-magenta to-lake-sunset' }
	];
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="Shop" title="Rep the brand" />
		<Button href={resolve('/shop')} label="View all →" variant="outline" />
	</div>
	<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each featured as item (item.name)}
			<a
				href={resolve('/shop')}
				class="border-missy-classic-lavender/12 overflow-hidden rounded-2xl border bg-[#1d1830]"
			>
				<div class={`h-52 bg-gradient-to-br ${item.grad}`}></div>
				<div class="flex items-center justify-between px-4 py-4">
					<div>
						<div class="text-sm font-semibold">{item.name}</div>
						<div class="text-missy-classic-lavender text-sm">{item.price}</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>
