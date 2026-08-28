<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Seo from '$lib/seo/Seo.svelte';
	import { formatPrice } from '$lib/shop/format';
	import { SHIPPING_RATE_CENTS } from '$lib/shop/config';

	const shippingRate = formatPrice(SHIPPING_RATE_CENTS);
	const contactEmail = 'missy.midwestofficial@gmail.com';
</script>

<Seo
	title="Shipping & Returns — Missy Midwest"
	description="Shipping rates, delivery times, and the return policy for Missy Midwest merch."
/>

<Section label="Shop" title="Shipping & Returns" width="narrow" reveal={false}>
	<div class="text-missy-secondary mt-2 space-y-8 leading-relaxed">
		<div>
			<h2 class="text-missy-pearl text-2xl">Where we ship</h2>
			<p class="mt-4">
				Missy Midwest merch ships within the United States only. We do not ship internationally at
				this time.
			</p>
		</div>

		<div>
			<h2 class="text-missy-pearl text-2xl">Shipping cost</h2>
			<p class="mt-4">
				Flat-rate shipping is <strong class="text-missy-pearl">{shippingRate}</strong> per order, no matter
				how many items you buy. You choose it at checkout.
			</p>
			<p class="mt-4">
				<strong class="text-missy-pearl">Local pickup is free.</strong> Pick this option at checkout and
				grab your order from Missy at an upcoming show.
			</p>
		</div>

		<div>
			<h2 class="text-missy-pearl text-2xl">Delivery time</h2>
			<p class="mt-4">
				Orders are packed and handed to the carrier within 3 business days. Delivery normally takes
				another 3 to 7 business days. Merch is made in small runs, so a busy drop can add a few
				days.
			</p>
		</div>

		<div>
			<h2 class="text-missy-pearl text-2xl">Returns</h2>
			<p class="mt-4">
				<strong class="text-missy-pearl">All sales are final.</strong> We do not accept returns or exchanges.
				Please check the size and color before you order.
			</p>
			<p class="mt-4">
				If your order arrives damaged, or the wrong item shows up, email
				<a href="mailto:{contactEmail}">{contactEmail}</a> within 14 days of delivery with a photo and
				your order number. We will make it right.
			</p>
		</div>

		<div>
			<h2 class="text-missy-pearl text-2xl">Cancellations</h2>
			<p class="mt-4">
				Orders can be cancelled for a full refund until they ship. Email
				<a href="mailto:{contactEmail}">{contactEmail}</a> as soon as you can.
			</p>
		</div>
	</div>
</Section>
