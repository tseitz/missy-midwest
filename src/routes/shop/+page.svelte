<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Shop — Missy Midwest</title>
</svelte:head>

<section class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-28 text-center md:px-14">
	<SectionHeading label="Shop" title="Merch is on the way" />
	<p class="max-w-md opacity-85">
		Hats and tees are dropping soon. In the meantime, catch a show or say hi.
	</p>
	<div class="mt-6 flex gap-4">
		<Button href={resolve('/shows')} label="See shows" variant="fill" />
		<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
	</div>
</section>
