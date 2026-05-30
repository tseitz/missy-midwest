<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import Seo from '$lib/seo/Seo.svelte';
</script>

<Seo title="Checkout cancelled — Missy Midwest" noindex />

<section class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-28 text-center md:px-14">
	<SectionHeading label="Checkout" title="Order cancelled" />
	<p class="max-w-md opacity-85">
		No charge was made. Your cart is still saved if you'd like to try again.
	</p>
	<div class="mt-6">
		<Button href={resolve('/shop')} label="Back to shop" variant="fill" />
	</div>
</section>
