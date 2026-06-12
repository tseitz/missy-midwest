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
		/**
		 * Content column width within the section shell.
		 * - `'wide'` (default): heading + body fill the shell (`max-w-screen-2xl`).
		 * - `'narrow'`: heading + body are centered in a reading column
		 *   (`max-w-5xl`) so large screens get even side margins — the standard
		 *   for text/list-heavy pages (Shows, Music) where full-bleed sprawls.
		 */
		width?: 'wide' | 'narrow';
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
		width = 'wide',
		children,
		action
	}: Props = $props();

	const shell = 'w-full max-w-screen-2xl px-8 py-16 md:px-14';
	// The inner column: full-width by default, or a centered reading column when narrow.
	const column = $derived(width === 'narrow' ? 'mx-auto w-full max-w-5xl' : 'w-full');
</script>

{#snippet body()}
	<div class={column}>
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
	</div>
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
