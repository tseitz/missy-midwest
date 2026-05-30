<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { cart } from '$lib/shop/cart.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	onMount(() => cart.clear());
</script>

<svelte:head>
	<title>Order confirmed — Missy Midwest</title>
</svelte:head>

<section class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-28 text-center md:px-14">
	<SectionHeading label="Thank you" title="Order confirmed" />
	<p class="max-w-md opacity-85">
		Your order is in — you'll get a receipt by email. Missy will be in touch about shipping or
		pickup.
	</p>
	<div class="mt-6">
		<Button href={resolve('/shop')} label="Back to shop" variant="outline" />
	</div>
</section>
