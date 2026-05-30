<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Shop — Missy Midwest</title>
</svelte:head>

<section class="max-w-screen-2xl w-full px-8 md:px-14 py-28 flex flex-col items-center text-center">
	<SectionHeading label="Shop" title="Merch is on the way" />
	<p class="max-w-md opacity-85">
		Hats and tees are dropping soon. In the meantime, catch a show or say hi.
	</p>
	<div class="mt-6 flex gap-4">
		<Button href="/shows" label="See shows" variant="fill" />
		<Button href="/contact" label="Get in touch" variant="outline" />
	</div>
</section>
