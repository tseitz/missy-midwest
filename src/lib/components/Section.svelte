<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal as revealAction } from '$lib/motion/reveal';
	import SectionHeading from '$lib/components/SectionHeading.svelte';

	interface Props {
		/** Eyebrow label for the SectionHeading (e.g. "SHOP"). Optional. */
		label?: string;
		/** Title for the SectionHeading (e.g. "Rep the brand"). Optional. */
		title?: string;
		/** Apply the scroll-reveal animation. Default true. */
		reveal?: boolean;
		/** Optional id for anchor links (e.g. "bio"). */
		id?: string;
		/** Extra classes appended to the section shell. Optional. */
		class?: string;
		/** Default slot: the section body. */
		children: Snippet;
		/** Optional slot rendered on the right side of the heading row (e.g. a "View all" Button). */
		action?: Snippet;
	}

	let {
		label = '',
		title,
		reveal = true,
		id,
		class: className,
		children,
		action
	}: Props = $props();

	const shell = 'w-full max-w-screen-2xl px-8 py-16 md:px-14';
</script>

{#snippet body()}
	{#if title}
		{#if action}
			<div class="flex items-center justify-between">
				<SectionHeading {label} {title} />
				{@render action()}
			</div>
		{:else}
			<SectionHeading {label} {title} />
		{/if}
	{/if}
	{@render children()}
{/snippet}

{#if reveal}
	<section use:revealAction {id} class="{shell} {className}">
		{@render body()}
	</section>
{:else}
	<section {id} class="{shell} {className}">
		{@render body()}
	</section>
{/if}
