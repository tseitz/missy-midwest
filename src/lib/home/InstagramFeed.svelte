<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { InstagramPost } from '$lib/home/instagram';

	interface Props {
		posts: InstagramPost[];
	}
	let { posts }: Props = $props();

	const placeholders = Array.from({ length: 6 }, (_, i) => i);
</script>

<Section label="@missy.midwest" title="From the feed">
	{#snippet action()}
		<Button href="https://www.instagram.com/missy.midwest/" label="Follow →" variant="outline" />
	{/snippet}
	{#if posts.length > 0}
		<!-- external Instagram permalinks; resolve() is for internal routes only -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<div class="mt-2 grid grid-cols-3 gap-2.5 md:grid-cols-6">
			{#each posts as post (post.id)}
				<a
					href={post.permalink}
					target="_blank"
					rel="noopener noreferrer"
					data-testid="ig-post"
					aria-label={post.caption ? `View Instagram post: ${post.caption}` : 'View Instagram post'}
					class="group relative aspect-square overflow-hidden rounded-lg"
				>
					<img
						src={post.imageUrl}
						alt={post.caption || 'Instagram post'}
						loading="lazy"
						decoding="async"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					{#if post.isVideo}
						<span class="absolute top-2 right-2 text-white drop-shadow" aria-hidden="true">▶</span>
					{/if}
				</a>
			{/each}
		</div>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{:else}
		<div class="mt-2 grid grid-cols-3 gap-2.5 md:grid-cols-6">
			{#each placeholders as i (i)}
				<div
					data-testid="ig-placeholder"
					class="from-missy-neon-lavender to-missy-magenta aspect-square rounded-lg bg-gradient-to-br opacity-80"
				></div>
			{/each}
		</div>
	{/if}
</Section>
