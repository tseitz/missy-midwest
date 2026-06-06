<script lang="ts">
	import { page } from '$app/state';
	import { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from '$lib/seo/config';

	interface Props {
		title: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'profile';
		noindex?: boolean;
	}
	let {
		title,
		description = DEFAULT_DESCRIPTION,
		image = DEFAULT_OG_IMAGE,
		type = 'website',
		noindex = false
	}: Props = $props();

	const origin = $derived(page.url.origin);
	const canonical = $derived(origin + page.url.pathname);
	// `image` may be root-relative (our assets) or already absolute (Stripe product URLs).
	const ogImage = $derived(image.startsWith('http') ? image : origin + image);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
