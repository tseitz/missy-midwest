<script lang="ts">
	import Contact from '$lib/contact/Contact.svelte';
	import PressKit from '$lib/press-kit/PressKit.svelte';
	import Seo from '$lib/seo/Seo.svelte';
</script>

<Seo
	title="Contact & Booking — Missy Midwest"
	description="Book Missy Midwest for festivals, residencies, workshops, and events."
/>

<div class="flex w-full flex-col items-center px-8 md:px-14">
	<Contact />
	<PressKit />
</div>
