<script lang="ts">
	import Contact from '$lib/contact/Contact.svelte';
	import PressKit from '$lib/press-kit/PressKit.svelte';
	import Seo from '$lib/seo/Seo.svelte';
</script>

<Seo
	title="Contact & Booking — Missy Midwest"
	description="Book Missy Midwest for festivals, residencies, workshops, and events."
/>

<!--
	Intentional outlier: unlike home/shows (where each section self-pads via
	<Section>), /contact pads at the wrapper so Contact + PressKit sit flush near
	the header. Pulling the booking form up out of the section area reads better
	here than the standard py-16 rhythm — keep their top spacing and DON'T route
	them through <Section> (that would push the form back down).
-->
<div class="flex w-full flex-col items-center px-8 md:px-14">
	<Contact />
	<PressKit />
</div>
