<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	// Phase 2 replaces this static list with featured products from Stripe.
	const featured = [
		{ name: 'Lavender Trucker', price: '$32', grad: 'from-missy-neon-lavender to-missy-blush' },
		{ name: 'Sunset Dad Hat', price: '$30', grad: 'from-missy-deep-purple to-lake-sunrise' },
		{ name: 'Tour Tee', price: '$28', grad: 'from-missy-magenta to-lake-sunset' }
	];
</script>

<section class="max-w-screen-2xl w-full px-8 md:px-14 py-16">
	<div class="flex items-end justify-between">
		<SectionHeading label="Shop" title="Rep the brand" />
		<Button href="/shop" label="View all →" variant="outline" />
	</div>
	<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-2">
		{#each featured as item (item.name)}
			<a
				href="/shop"
				class="rounded-2xl overflow-hidden border border-missy-classic-lavender/12 bg-[#1d1830]"
			>
				<div class={`h-52 bg-gradient-to-br ${item.grad}`}></div>
				<div class="flex items-center justify-between px-4 py-4">
					<div>
						<div class="font-semibold text-sm">{item.name}</div>
						<div class="text-missy-classic-lavender text-sm">{item.price}</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>
